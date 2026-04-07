
<script>
  import AudioUpload from './lib/AudioUpload.svelte'
  import Navbar from './lib/Navbar.svelte'

  let vocalsUrl = null
  let instrumentalUrl = null
  let isProcessing = false
  let statusText = ''

  function handleProcessStart() {
    isProcessing = true
    vocalsUrl = null
    instrumentalUrl = null
    statusText = ''
  }

  function handleProcessComplete(e) {
    isProcessing = false
    vocalsUrl = e.detail.vocalsUrl
    instrumentalUrl = e.detail.instrumentalUrl
    statusText = e.detail.status || 'Listo'
  }

  function handleProcessError(e) {
    isProcessing = false
    statusText = 'Error: ' + e.detail.error
  }
</script>

<main>
  <Navbar />
  <div class="container">
    <div class="left-panel">
      <AudioUpload
        on:processStart={handleProcessStart}
        on:processComplete={handleProcessComplete}
        on:processError={handleProcessError}
      />
    </div>
    <div class="right-panel">
      <div class="output-box">
        <div class="label">🎤 Vocales</div>
        {#if isProcessing}
          <span class="processing">⏳ Procesando...</span>
        {:else if vocalsUrl}
          <audio controls src={vocalsUrl} class="audio-player"></audio>
          <a href={vocalsUrl} download="vocales.wav" class="download-link">⬇️ Descargar</a>
        {:else}
          <span>Esperando procesamiento...</span>
        {/if}
      </div>
      <div class="output-box">
        <div class="label">🎸 Instrumental</div>
        {#if isProcessing}
          <span class="processing">⏳ Procesando...</span>
        {:else if instrumentalUrl}
          <audio controls src={instrumentalUrl} class="audio-player"></audio>
          <a href={instrumentalUrl} download="instrumental.wav" class="download-link">⬇️ Descargar</a>
        {:else}
          <span>Esperando procesamiento...</span>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  }
  main {
    background: linear-gradient(135deg, #0052cc 0%, #004999 50%, #003366 100%);
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .container {
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: flex-start;
    flex: 1;
    padding: 2rem;
  }
  .left-panel {
    min-width: 320px;
    max-width: 400px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .right-panel {
    min-width: 320px;
    max-width: 400px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: stretch;
  }
  .output-box {
    background: rgba(255,255,255,0.05);
    border: 2px dashed #90caf9;
    border-radius: 1rem;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: border-color 0.2s;
    margin-bottom: 1rem;
    padding: 1.5rem;
  }
  .label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #90caf9;
    font-size: 1.1rem;
  }
  .processing {
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .audio-player {
    width: 100%;
    margin: 0.5rem 0;
    border-radius: 8px;
  }
  .download-link {
    color: #90caf9;
    text-decoration: none;
    font-weight: 600;
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.1);
    border-radius: 6px;
    transition: all 0.2s;
  }
  .download-link:hover {
    background: rgba(255,255,255,0.2);
  }
</style>
