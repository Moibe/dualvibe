<script>
  import LoginButton from './LoginButton.svelte'
</script>

<nav class="navbar">
  <div class="navbar-content">
    <div class="navbar-left">
      <a href="/" class="logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">DualVibe</span>
      </a>
    </div>
    
    <div class="navbar-right">
      <a href="/" class="nav-link">Inicio</a>
      <a href="/#about" class="nav-link">Acerca de</a>
      <a href="/#contact" class="nav-link">Contacto</a>
      <LoginButton />
    </div>
  </div>
</nav>

<style>
  .navbar {
    background: white;
    border-bottom: 3px solid #2563eb;
    padding: 0.3rem 2rem;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    box-sizing: border-box;
  }

  .navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    height: 45px;
  }

  .navbar-left {
    display: flex;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .logo:hover {
    transform: translateY(-2px);
  }

  .logo-icon {
    font-size: 1.2rem;
  }

  .logo-text {
    font-weight: 700;
    font-size: 1.15rem;
    color: #0052cc;
    letter-spacing: -0.5px;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .nav-link {
    color: #666;
    text-decoration: none;
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
    border-radius: 4px;
  }

  .nav-link:hover {
    color: #0052cc;
    background: rgba(2, 82, 204, 0.05);
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 0.25rem 1rem;
    }

    .navbar-content {
      height: 40px;
    }

    .logo-text {
      font-size: 1rem;
    }

    .nav-link {
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
    }
  }
</style>
