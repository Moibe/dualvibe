
<script>
  import AudioUpload from './lib/AudioUpload.svelte';
  let vocalAudio = null;
  let instrumentalAudio = null;
</script>

<main>
  <div class="container">
    <div class="left-panel">
      <AudioUpload />
    </div>
    <div class="right-panel">
      <div class="output-box">
        <div class="label">Vocales</div>
        <span>Esperando procesamiento...</span>
      </div>
      <div class="output-box">
        <div class="label">Instrumental</div>
        <span>Esperando procesamiento...</span>
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
  }
  .container {
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
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
</style>
