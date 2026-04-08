import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBrUWVi4oqg11QnHfxPhnI85z1HYVV-E8M",
  authDomain: "dualvibe-182.firebaseapp.com",
  projectId: "dualvibe-182",
  storageBucket: "dualvibe-182.firebasestorage.app",
  messagingSenderId: "458485861333",
  appId: "1:458485861333:web:1962d2d50fe4a2ef598b5c",
  measurementId: "G-7F9LLFD6YT"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

const API_BASE = 'https://moibe-fastapi-mariadb-dualvibe.hf.space'

function cdmxNow() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' }).replace(' ', 'T')
}

export async function registerUserInAPI(firebaseUser) {
  try {
    const now = cdmxNow()
    const response = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName || '',
        photo_url: firebaseUser.photoURL || '',
        provider: firebaseUser.providerData[0]?.providerId || 'google.com',
        email_verified: firebaseUser.emailVerified,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Error registrando usuario en API:', response.status, errText)
      return null
    }

    const data = await response.json()
    console.log('✅ Usuario registrado/actualizado en API:', data)
    return data
  } catch (err) {
    console.error('Error conectando con API:', err)
    return null
  }
}

export async function saveProcessing(data) {
  try {
    const now = cdmxNow()
    const response = await fetch(`${API_BASE}/api/processings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, created_at: now })
    })
    if (!response.ok) {
      const errText = await response.text()
      console.error('Error guardando procesamiento:', response.status, errText)
      return null
    }
    const result = await response.json()
    console.log('✅ Procesamiento guardado:', result)
    return result
  } catch (err) {
    console.error('Error conectando con API (processings):', err)
    return null
  }
}

export async function getUsage(firebaseUid) {
  try {
    const response = await fetch(`${API_BASE}/api/usage/${firebaseUid}`)
    if (!response.ok) return null
    return await response.json()
  } catch (err) {
    console.error('Error obteniendo usage:', err)
    return null
  }
}

export async function createUsage(firebaseUser) {
  try {
    const response = await fetch(`${API_BASE}/api/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        usos: 0,
        creditos: 0
      })
    })
    if (!response.ok) {
      const errText = await response.text()
      console.error('Error creando usage:', response.status, errText)
      return null
    }
    const data = await response.json()
    console.log('✅ Usage creado:', data)
    return data
  } catch (err) {
    console.error('Error conectando con API (usage):', err)
    return null
  }
}

export async function incrementarUso(firebaseUid) {
  try {
    const usage = await getUsage(firebaseUid)
    if (!usage) {
      console.warn('No se encontró usage para:', firebaseUid)
      return null
    }
    const response = await fetch(`${API_BASE}/api/usage/${firebaseUid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usos: usage.usos + 1 })
    })
    if (!response.ok) {
      const errText = await response.text()
      console.error('Error incrementando uso:', response.status, errText)
      return null
    }
    const data = await response.json()
    console.log('✅ Uso incrementado:', data)
    return data
  } catch (err) {
    console.error('Error conectando con API (incrementar uso):', err)
    return null
  }
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  await registerUserInAPI(result.user)
  const existing = await getUsage(result.user.uid)
  if (!existing) {
    await createUsage(result.user)
  }
  return result
}

export async function logout() {
  return signOut(auth)
}
