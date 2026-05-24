import { useState } from 'react'
import { GROUPS, getFlagUrl } from '../data/worldcup'
import { signIn, signUp, sendPasswordReset, isUsernameTaken } from '../services/database'

const FLAG = (code: string) => getFlagUrl(code, 40)

interface Props {
  onSetup: (userId: string) => void
}

export default function Setup({ onSetup }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [step, setStep] = useState<1|2|3>(1) // 1: usuario/email, 2: contraseña, 3: equipo
  
  // Login
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  
  // Register
  const [regUser, setRegUser] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regPassConfirm, setRegPassConfirm] = useState('')
  const [regFav, setRegFav] = useState('')

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const allTeams = GROUPS.flatMap(g => g.matches.flatMap(m => [m.home, m.away]))
  const unique = Array.from(new Map(allTeams.map(t => [t.abbr, t])).values())
    .sort((a,b) => a.name.localeCompare(b.name))

  // ==================== LOGIN ====================
  const handleLogin = async () => {
    setError('')
    
    if (!loginUser.trim()) {
      setError('Ingresa tu usuario o email')
      return
    }
    if (!loginPass.trim()) {
      setError('Ingresa tu contraseña')
      return
    }

    setLoading(true)
    try {
      const { user } = await signIn(loginUser, loginPass)
      if (!user) throw new Error('Usuario o contraseña incorrectos')
      onSetup(user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setForgotSuccess('')
    if (!forgotEmail.includes('@')) {
      setError('Ingresa un email válido')
      return
    }
    setLoading(true)
    try {
      await sendPasswordReset(forgotEmail)
      setForgotSuccess('Te enviamos un enlace a tu email para restablecer la contraseña.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterStep1 = async () => {
    setError('')
    
    if (!regUser.trim()) {
      setError('Ingresa tu nombre de usuario')
      return
    }
    if (regUser.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres')
      return
    }
    if (regUser.length > 20) {
      setError('El usuario no puede tener más de 20 caracteres')
      return
    }

    if (await isUsernameTaken(regUser)) {
      setError('Este usuario ya existe')
      return
    }

    if (!regEmail.includes('@')) {
      setError('Ingresa un email válido')
      return
    }
    setStep(2)
  }

  const handleRegisterStep2 = () => {
    setError('')
    
    if (!regPass.trim()) {
      setError('Ingresa una contraseña')
      return
    }
    if (regPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (regPass !== regPassConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setStep(3)
  }

  const handleRegisterStep3 = async () => {
    setError('')

    if (!regFav) {
      setError('Selecciona un equipo favorito')
      return
    }

    setLoading(true)
    setRegisterSuccess('')
    try {
      const { user } = await signUp(regEmail, regPass, regUser, regFav)
      if (!user) throw new Error('No se pudo crear la cuenta')
      onSetup(user.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse'
      if (msg.includes('Revisa tu email')) {
        setRegisterSuccess(msg)
        setMode('login')
        setStep(1)
        setError('')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wc-setup">

      {/* Fondo decorativo */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[600,450,300].map(s => (
          <div key={s} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:'1px solid rgba(245,200,66,.05)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        ))}
      </div>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:500, textAlign:'center' }}>

        {/* Logo */}
        <div style={{ marginBottom:40, animation:'fadeUp 0.7s ease' }}>
          <div style={{ fontFamily:'Oswald,sans-serif', fontSize:13, color:'var(--red)', letterSpacing:6, marginBottom:6, fontWeight:700 }}>FIFA</div>
          <div style={{ fontFamily:'Oswald,sans-serif', fontSize:64, fontWeight:700, color:'#fff', letterSpacing:4, lineHeight:1, marginBottom:6 }}>MUNDIAL</div>
          <div style={{ fontFamily:'Oswald,sans-serif', fontSize:64, fontWeight:700, color:'var(--gold)', letterSpacing:4, lineHeight:1 }}>2026</div>
          <div style={{ color:'var(--text3)', fontSize:12, letterSpacing:4, textTransform:'uppercase', marginTop:10, fontWeight:600 }}>
            USA · CANADA · MEXICO
          </div>
        </div>

        {/* Tabs: Login / Register */}
        <div style={{ display:'flex', gap:10, marginBottom:32, background:'rgba(255,255,255,.04)', borderRadius:12, padding:4 }}>
          <button onClick={() => { setMode('login'); setStep(1); setError(''); setRegisterSuccess('') }}
            style={{ flex:1, padding:12, borderRadius:10, border:'none', background:mode==='login'?'rgba(245,200,66,.15)':'transparent', color:mode==='login'?'var(--gold)':'var(--text2)', fontFamily:'Oswald,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
            INICIAR SESIÓN
          </button>
          <button onClick={() => { setMode('register'); setStep(1); setError('') }}
            style={{ flex:1, padding:12, borderRadius:10, border:'none', background:mode==='register'?'rgba(59,130,246,.15)':'transparent', color:mode==='register'?'#3b82f6':'var(--text2)', fontFamily:'Oswald,sans-serif', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
            REGISTRARSE
          </button>
        </div>

        {/* ==================== LOGIN ==================== */}
        {mode === 'login' && (
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:32, animation:'fadeUp 0.5s ease' }}>
            <div style={{ color:'var(--text)', fontSize:18, fontWeight:600, marginBottom:6 }}>Bienvenido</div>
            <div style={{ color:'var(--text3)', fontSize:13, marginBottom:24 }}>Ingresa tus datos para acceder</div>
            
            {/* Usuario/Email */}
            <input
              type="text" 
              placeholder="Usuario o email" 
              value={loginUser}
              onChange={e => { setLoginUser(e.target.value); setError('') }}
              onKeyDown={e => e.key==='Enter' && !loading && handleLogin()}
              style={{ 
                width:'100%', 
                background:'rgba(255,255,255,.06)', 
                border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, 
                borderRadius:10, 
                color:'var(--text)', 
                padding:'14px 18px', 
                fontSize:15, 
                outline:'none', 
                fontFamily:'Inter,sans-serif',
                marginBottom:12,
                transition:'all .2s'
              }}
              onFocus={e => !error && (e.target.style.borderColor='var(--gold)')}
              onBlur={e => (e.target.style.borderColor=error ? 'var(--red)' : 'rgba(255,255,255,.1)')}
            />

            {/* Contraseña */}
            <input
              type="password" 
              placeholder="Contraseña" 
              value={loginPass}
              onChange={e => { setLoginPass(e.target.value); setError('') }}
              onKeyDown={e => e.key==='Enter' && !loading && handleLogin()}
              style={{ 
                width:'100%', 
                background:'rgba(255,255,255,.06)', 
                border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, 
                borderRadius:10, 
                color:'var(--text)', 
                padding:'14px 18px', 
                fontSize:15, 
                outline:'none', 
                fontFamily:'Inter,sans-serif',
                marginBottom:error ? 8 : 24,
                transition:'all .2s'
              }}
              onFocus={e => !error && (e.target.style.borderColor='var(--gold)')}
              onBlur={e => (e.target.style.borderColor=error ? 'var(--red)' : 'rgba(255,255,255,.1)')}
            />

            {error && (
              <div style={{ color:'var(--red)', fontSize:12, marginBottom:16, display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}>
                {error}
              </div>
            )}
            {registerSuccess && (
              <div style={{ color:'var(--green)', fontSize:12, marginBottom:16, textAlign:'center' }}>
                {registerSuccess}
              </div>
            )}

            <button onClick={handleLogin} disabled={loading}
              style={{ 
                width:'100%', 
                padding:14, 
                background: loading ? '#1a2030' : 'var(--gold)', 
                border:'none', 
                borderRadius:10, 
                color: loading ? 'var(--text3)' : '#0a0a0a', 
                fontFamily:'Oswald,sans-serif', 
                fontSize:16, 
                fontWeight:700, 
                letterSpacing:3, 
                cursor:loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition:'all .2s'
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background='#f0c96a' }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.background='var(--gold)' }}
            >
              {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
            </button>

            <button type="button" onClick={() => { setMode('forgot'); setError(''); setForgotSuccess('') }}
              style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              ¿Olvidaste tu contraseña?
            </button>

          </div>
        )}

        {/* ==================== FORGOT PASSWORD ==================== */}
        {mode === 'forgot' && (
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:32, animation:'fadeUp 0.5s ease' }}>
            <div style={{ color:'var(--text)', fontSize:18, fontWeight:600, marginBottom:6 }}>Recuperar contraseña</div>
            <div style={{ color:'var(--text3)', fontSize:13, marginBottom:24 }}>Te enviaremos un enlace a tu email</div>

            <input type="email" placeholder="Correo electrónico" value={forgotEmail}
              onChange={e => { setForgotEmail(e.target.value); setError(''); setForgotSuccess('') }}
              style={{ width:'100%', background:'rgba(255,255,255,.06)', border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, borderRadius:10, color:'var(--text)', padding:'14px 18px', fontSize:15, outline:'none', marginBottom:16, boxSizing:'border-box' }} />

            {error && <div style={{ color:'var(--red)', fontSize:12, marginBottom:12 }}>{error}</div>}
            {forgotSuccess && <div style={{ color:'var(--green)', fontSize:12, marginBottom:12 }}>{forgotSuccess}</div>}

            <button onClick={handleForgotPassword} disabled={loading}
              style={{ width:'100%', padding:14, background:'var(--gold)', border:'none', borderRadius:10, color:'#0a0a0a', fontFamily:'Oswald,sans-serif', fontSize:16, fontWeight:700, cursor: loading ? 'default' : 'pointer', marginBottom:12, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'ENVIANDO…' : 'ENVIAR ENLACE'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError('') }}
              style={{ width:'100%', padding:12, background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, color:'var(--text2)', cursor:'pointer' }}>
              ← Volver al login
            </button>
          </div>
        )}

        {/* ==================== REGISTER ==================== */}
        {mode === 'register' && (
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:32, animation:'fadeUp 0.5s ease' }}>
            
            {/* STEP 1: Usuario + Email */}
            {step === 1 && (
              <>
                <div style={{ color:'var(--text)', fontSize:18, fontWeight:600, marginBottom:6 }}>Crear cuenta</div>
                <div style={{ color:'var(--text3)', fontSize:13, marginBottom:24 }}>Paso 1 de 3: Datos personales</div>
                
                <input
                  type="text" 
                  placeholder="Nombre de usuario" 
                  value={regUser}
                  onChange={e => { setRegUser(e.target.value); setError('') }}
                  maxLength={20}
                  style={{ 
                    width:'100%', 
                    background:'rgba(255,255,255,.06)', 
                    border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, 
                    borderRadius:10, 
                    color:'var(--text)', 
                    padding:'14px 18px', 
                    fontSize:15, 
                    outline:'none', 
                    fontFamily:'Inter,sans-serif',
                    marginBottom:12,
                    transition:'all .2s'
                  }}
                  onFocus={e => !error && (e.target.style.borderColor='#3b82f6')}
                  onBlur={e => (e.target.style.borderColor=error ? 'var(--red)' : 'rgba(255,255,255,.1)')}
                />

                <input
                  type="email" 
                  placeholder="Correo electrónico" 
                  value={regEmail}
                  onChange={e => { setRegEmail(e.target.value); setError('') }}
                  style={{ 
                    width:'100%', 
                    background:'rgba(255,255,255,.06)', 
                    border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, 
                    borderRadius:10, 
                    color:'var(--text)', 
                    padding:'14px 18px', 
                    fontSize:15, 
                    outline:'none', 
                    fontFamily:'Inter,sans-serif',
                    marginBottom:error ? 8 : 12,
                    transition:'all .2s'
                  }}
                  onFocus={e => !error && (e.target.style.borderColor='#3b82f6')}
                  onBlur={e => (e.target.style.borderColor=error ? 'var(--red)' : 'rgba(255,255,255,.1)')}
                />

                <div style={{ color:'#505666', fontSize:12, marginBottom:24 }}>
                  {regUser.length}/20 caracteres
                </div>

                {error && (
                  <div style={{ color:'var(--red)', fontSize:12, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button onClick={handleRegisterStep1}
                  style={{ 
                    width:'100%', 
                    padding:14, 
                    background: regUser.length < 3 ? '#1a2030' : '#3b82f6', 
                    border:'none', 
                    borderRadius:10, 
                    color: regUser.length < 3 ? 'var(--text3)' : '#fff', 
                    fontFamily:'Oswald,sans-serif', 
                    fontSize:14, 
                    fontWeight:700, 
                    letterSpacing:2, 
                    cursor:regUser.length < 3 ? 'default' : 'pointer',
                    transition:'all .2s'
                  }}
                  onMouseEnter={e => { if(regUser.length >= 3) e.currentTarget.style.background='#60a5fa' }}
                  onMouseLeave={e => { if(regUser.length >= 3) e.currentTarget.style.background='#3b82f6' }}
                >
                  SIGUIENTE →
                </button>
              </>
            )}

            {/* STEP 2: Contraseña */}
            {step === 2 && (
              <>
                <div style={{ color:'var(--text)', fontSize:18, fontWeight:600, marginBottom:6 }}>Crear cuenta</div>
                <div style={{ color:'var(--text3)', fontSize:13, marginBottom:24 }}>Paso 2 de 3: Contraseña segura</div>
                
                <input
                  type="password" 
                  placeholder="Contraseña (mín. 6 caracteres)" 
                  value={regPass}
                  onChange={e => { setRegPass(e.target.value); setError('') }}
                  style={{ 
                    width:'100%', 
                    background:'rgba(255,255,255,.06)', 
                    border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, 
                    borderRadius:10, 
                    color:'var(--text)', 
                    padding:'14px 18px', 
                    fontSize:15, 
                    outline:'none', 
                    fontFamily:'Inter,sans-serif',
                    marginBottom:12,
                    transition:'all .2s'
                  }}
                  onFocus={e => !error && (e.target.style.borderColor='#3b82f6')}
                  onBlur={e => (e.target.style.borderColor=error ? 'var(--red)' : 'rgba(255,255,255,.1)')}
                />

                <input
                  type="password" 
                  placeholder="Confirmar contraseña" 
                  value={regPassConfirm}
                  onChange={e => { setRegPassConfirm(e.target.value); setError('') }}
                  style={{ 
                    width:'100%', 
                    background:'rgba(255,255,255,.06)', 
                    border:`1px solid ${error ? 'var(--red)' : 'rgba(255,255,255,.1)'}`, 
                    borderRadius:10, 
                    color:'var(--text)', 
                    padding:'14px 18px', 
                    fontSize:15, 
                    outline:'none', 
                    fontFamily:'Inter,sans-serif',
                    marginBottom:error ? 8 : 24,
                    transition:'all .2s'
                  }}
                  onFocus={e => !error && (e.target.style.borderColor='#3b82f6')}
                  onBlur={e => (e.target.style.borderColor=error ? 'var(--red)' : 'rgba(255,255,255,.1)')}
                />

                {error && (
                  <div style={{ color:'var(--red)', fontSize:12, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setStep(1)}
                    style={{ flex:1, padding:14, background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, color:'var(--text2)', fontFamily:'Oswald,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.25)'; e.currentTarget.style.color='var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='var(--text2)' }}
                  >
                    ← ATRÁS
                  </button>
                  <button onClick={handleRegisterStep2}
                    disabled={regPass.length < 6}
                    style={{ flex:1, padding:14, background:regPass.length < 6?'#1a2030':'#3b82f6', border:'none', borderRadius:10, color:regPass.length < 6?'var(--text3)':'#fff', fontFamily:'Oswald,sans-serif', fontSize:12, fontWeight:700, letterSpacing:1, cursor:regPass.length < 6?'default':'pointer', transition:'all .2s' }}
                    onMouseEnter={e => { if(regPass.length >= 6) e.currentTarget.style.background='#60a5fa' }}
                    onMouseLeave={e => { if(regPass.length >= 6) e.currentTarget.style.background='#3b82f6' }}
                  >
                    SIGUIENTE →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Equipo favorito */}
            {step === 3 && (
              <>
                <div style={{ color:'var(--text)', fontSize:18, fontWeight:600, marginBottom:6 }}>Crear cuenta</div>
                <div style={{ color:'var(--text3)', fontSize:13, marginBottom:20 }}>Paso 3 de 3: Equipo favorito</div>
                
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, maxHeight:280, overflowY:'auto', marginBottom:20, paddingRight:4 }}>
                  {unique.map(team => (
                    <div key={team.abbr} onClick={() => { setRegFav(team.abbr); setError('') }}
                      style={{ 
                        padding:'10px 6px', 
                        borderRadius:10, 
                        cursor:'pointer', 
                        border:`2px solid ${regFav===team.abbr ? 'var(--gold)' : 'rgba(255,255,255,.07)'}`, 
                        background:regFav===team.abbr ? 'rgba(245,200,66,.1)' : 'rgba(255,255,255,.02)', 
                        display:'flex', 
                        flexDirection:'column', 
                        alignItems:'center', 
                        gap:6,
                        transition:'all .2s'
                      }}
                      onMouseEnter={e => { if(regFav!==team.abbr) e.currentTarget.style.borderColor='rgba(255,255,255,.15)' }}
                      onMouseLeave={e => { if(regFav!==team.abbr) e.currentTarget.style.borderColor='rgba(255,255,255,.07)' }}
                    >
                      <img src={FLAG(team.flag)} style={{ width:32, height:22, objectFit:'cover', borderRadius:3 }} onError={e => (e.target as HTMLImageElement).style.display='none'} />
                      <div style={{ color:regFav===team.abbr?'var(--gold)':'var(--text2)', fontSize:10, fontWeight:600, textAlign:'center', lineHeight:1.2 }}>{team.name}</div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{ color:'var(--red)', fontSize:12, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setStep(2)}
                    style={{ flex:1, padding:14, background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, color:'var(--text2)', fontFamily:'Oswald,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.25)'; e.currentTarget.style.color='var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.color='var(--text2)' }}
                  >
                    ← ATRÁS
                  </button>
                  <button onClick={handleRegisterStep3}
                    disabled={!regFav || loading}
                    style={{ flex:1, padding:14, background:regFav?'#3b82f6':'#1a2030', border:'none', borderRadius:10, color:regFav?'#fff':'var(--text3)', fontFamily:'Oswald,sans-serif', fontSize:12, fontWeight:700, letterSpacing:1, cursor:regFav?'pointer':'default', opacity:loading?0.7:1, transition:'all .2s' }}
                    onMouseEnter={e => { if(regFav && !loading) e.currentTarget.style.background='#60a5fa' }}
                    onMouseLeave={e => { if(regFav && !loading) e.currentTarget.style.background='#3b82f6' }}
                  >
                    {loading ? '⏳ REGISTRANDO...' : '✓ CREAR CUENTA'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}