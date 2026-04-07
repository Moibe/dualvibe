<script>
  import { user } from './authStore'
  import { loginWithGoogle, logout } from './firebase'

  let loading = false

  async function handleLogin() {
    loading = true
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Error al autenticarse:', err)
    } finally {
      loading = false
    }
  }
</script>

{#if $user}
  <button class="user-btn" on:click={logout}>
    <img src={$user.photoURL} alt="" class="avatar" referrerpolicy="no-referrer" />
    <span class="user-email">{$user.email}</span>
  </button>
{:else}
  <button class="login-btn" on:click={handleLogin} disabled={loading}>
    {loading ? '...' : 'Iniciar sesión'}
  </button>
{/if}

<style>
  .login-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.45rem 1.2rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .login-btn:hover {
    background: #1e53a0;
    transform: translateY(-1px);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: 1px solid #e0e0e0;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .user-btn:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: #ccc;
  }

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .user-email {
    font-size: 0.8rem;
    color: #555;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
