<script>
  import { Client } from '@gradio/client'
  import { createEventDispatcher } from 'svelte'
  import { saveProcessing } from './firebase'
  import { user } from './authStore'

  const dispatch = createEventDispatcher()

  let audioFile = null
  let audioName = ''
  let inputElement
  let isLoading = false
  let progress = 0
  let showSuccess = false
  let audioElement
  let isPlaying = false
  let currentTime = 0
  let duration = 0
  let volume = 1
  let isProcessing = false
  let processError = null

  function handleClick() {
    if (!isLoading && !audioFile) {
      inputElement.click()
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      isLoading = true
      progress = 0

      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) progress = 90
      }, 100)

      setTimeout(() => {
        clearInterval(progressInterval)
        progress = 100
        audioFile = file
        audioName = file.name
        isLoading = false
        showSuccess = true

        setTimeout(() => {
          showSuccess = false
        }, 3000)
      }, 200)
    } else if (file) {
      alert('Por favor selecciona un archivo de audio válido')
      audioFile = null
      audioName = ''
    }
  }

  function clearAudio() {
    audioFile = null
    audioName = ''
    progress = 0
    showSuccess = false
    isPlaying = false
    currentTime = 0
    duration = 0
    if (inputElement) inputElement.value = ''
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }
  }

  function togglePlay() {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play()
      }
      isPlaying = !isPlaying
    }
  }

  function handleTimeUpdate() {
    if (audioElement) {
      currentTime = audioElement.currentTime
      duration = audioElement.duration || 0
    }
  }

  function handleEnded() {
    isPlaying = false
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function handleProgressClick(e) {
    if (audioElement && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioElement.currentTime = percent * duration
    }
  }

  function handleVolumeChange(e) {
    volume = parseFloat(e.target.value)
    if (audioElement) {
      audioElement.volume = volume
    }
  }

  async function processAudio() {
    if (!audioFile || isProcessing) return
    isProcessing = true
    processError = null
    dispatch('processStart')

    const startTime = Date.now()

    try {
      const client = await Client.connect('CleanSong/demucs-splitter')
      const result = await client.predict('/split_vocals', {
        audio_file: audioFile,
      })

      const vocalsUrl = result.data[0]?.url
      const instrumentalUrl = result.data[1]?.url
      const status = result.data[2]
      const processingTimeMs = Date.now() - startTime

      dispatch('processComplete', { vocalsUrl, instrumentalUrl, status })

      await saveProcessing({
        firebase_uid: $user?.uid || null,
        original_filename: audioFile.name,
        file_size_bytes: audioFile.size,
        duration_seconds: duration || null,
        vocals_url: vocalsUrl || null,
        instrumental_url: instrumentalUrl || null,
        status: 'success',
        error_message: null,
        processing_time_ms: processingTimeMs,
        space_used: 'CleanSong/demucs-splitter'
      })
    } catch (err) {
      console.error('Error procesando audio:', err)
      processError = err.message || 'Error al procesar el audio'
      dispatch('processError', { error: processError })

      await saveProcessing({
        firebase_uid: $user?.uid || null,
        original_filename: audioFile.name,
        file_size_bytes: audioFile.size,
        duration_seconds: duration || null,
        vocals_url: null,
        instrumental_url: null,
        status: 'error',
        error_message: processError,
        processing_time_ms: Date.now() - startTime,
        space_used: 'CleanSong/demucs-splitter'
      })
    } finally {
      isProcessing = false
    }
  }
</script>

<div class="upload-container">
  <div class="upload-box" on:click={handleClick} on:keydown={e => e.key === 'Enter' && handleClick()}>
    {#if isLoading}
      <div class="loading-state">
        <p class="loading-icon">⏳</p>
        <p class="loading-text">Cargando archivo...</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
      </div>
    {:else if audioFile}
      <div class="file-info">
        <p class="file-icon">🎵</p>
        <p class="file-name">{audioName}</p>
        <p class="file-size">({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</p>
        {#if showSuccess}
          <div class="success-badge">✓ Cargado correctamente</div>
        {/if}
      </div>
    {:else}
      <div class="empty-state">
        <p class="upload-icon">🎧</p>
        <p class="upload-text">Haz click para cargar un audio</p>
        <p class="upload-hint">Solo archivos de audio</p>
      </div>
    {/if}
  </div>

  {#if audioFile && !isLoading}
    <div class="player-container">
      <div class="player-controls">
        <button class="play-btn" on:click={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div class="timeline-wrapper">
          <span class="time-display">{formatTime(currentTime)}</span>
          <div class="timeline" on:click={handleProgressClick}>
            <div class="timeline-progress" style="width: {duration ? (currentTime / duration) * 100 : 0}%"></div>
          </div>
          <span class="time-display">{formatTime(duration)}</span>
        </div>
        <div class="volume-control">
          <span>🔊</span>
          <input type="range" min="0" max="1" step="0.1" bind:value={volume} on:change={handleVolumeChange} />
        </div>
      </div>
    </div>

    <button class="clear-btn" on:click={clearAudio}>
      ✕ Limpiar
    </button>
    <button class="process-btn" on:click={processAudio} disabled={isProcessing}>
      {isProcessing ? '⏳ Procesando...' : '⚙️ Procesar'}
    </button>
    {#if processError}
      <div class="error-msg">{processError}</div>
    {/if}
  {/if}
</div>

<audio
  bind:this={audioElement}
  on:timeupdate={handleTimeUpdate}
  on:ended={handleEnded}
  {volume}
>
  {#if audioFile}
    <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
  {/if}
</audio>

<input
  bind:this={inputElement}
  type="file"
  accept="audio/*"
  on:change={handleFileSelect}
  style="display: none"
  disabled={isLoading}
/>

<style>
  .upload-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .upload-box {
    border: 2px dashed rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.05);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-box:hover:not(.loading-state) {
    border-color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }

  .upload-box:active:not(.loading-state) {
    transform: scale(0.98);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .upload-icon {
    font-size: 3rem;
    margin: 0;
  }

  .upload-text {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .upload-hint {
    font-size: 0.9rem;
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .loading-icon {
    font-size: 2.5rem;
    margin: 0;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: white;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4A90E2, #2563eb);
    border-radius: 4px;
    transition: width 0.2s ease;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .file-icon {
    font-size: 3rem;
    margin: 0;
  }

  .file-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: white;
    word-break: break-all;
  }

  .file-size {
    font-size: 0.85rem;
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .success-badge {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.5);
    border-radius: 6px;
    color: #86efac;
    font-size: 0.9rem;
    font-weight: 600;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .player-container {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 1rem;
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .play-btn {
    background: linear-gradient(135deg, #4A90E2, #2563eb);
    color: white;
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .play-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  }

  .play-btn:active {
    transform: scale(0.95);
  }

  .timeline-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .time-display {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    font-weight: 500;
    min-width: 35px;
  }

  .timeline {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    cursor: pointer;
    overflow: hidden;
    transition: height 0.2s ease;
  }

  .timeline:hover {
    height: 8px;
  }

  .timeline-progress {
    height: 100%;
    background: linear-gradient(90deg, #4A90E2, #2563eb);
    border-radius: 3px;
    transition: width 0.1s linear;
  }

  .volume-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 120px;
  }

  .volume-control input[type='range'] {
    width: 70px;
    cursor: pointer;
    accent-color: #4A90E2;
  }

  .clear-btn {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    width: 100%;
  }

  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }


  .clear-btn:active {
    transform: scale(0.95);
  }

  .process-btn {
    width: 100%;
    background: linear-gradient(135deg, #a259c6, #6d28d9);
    color: white;
    border: none;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    margin-top: 0.7rem;
  }

  .process-btn:hover {
    background: linear-gradient(135deg, #6d28d9, #a259c6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 0, 180, 0.3);
  }

  .process-btn:active {
    transform: translateY(0);
  }

  .process-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .error-msg {
    color: #fca5a5;
    background: rgba(220, 38, 38, 0.15);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    text-align: center;
    width: 100%;
  }

  @media (max-width: 600px) {
    .timeline-wrapper {
      gap: 0.5rem;
    }

    .time-display {
      font-size: 0.75rem;
      min-width: 30px;
    }

    .volume-control {
      display: none;
    }
  }
</style>
