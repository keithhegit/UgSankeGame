import { writeFileSync } from 'fs';
import { join } from 'path';

function generateTone(frequency: number, duration: number, sampleRate = 44100): Float32Array {
  const samples = duration * sampleRate;
  const buffer = new Float32Array(samples);
  const angularFrequency = 2 * Math.PI * frequency;

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    buffer[i] = Math.sin(angularFrequency * t) * Math.exp(-3 * t);
  }

  return buffer;
}

function generateWAV(buffer: Float32Array): Buffer {
  const dataLength = buffer.length * 2;
  const fileLength = 44 + dataLength;

  const wav = Buffer.alloc(fileLength);

  // WAV Header
  wav.write('RIFF', 0);
  wav.writeUInt32LE(fileLength - 8, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(44100, 24);
  wav.writeUInt32LE(44100 * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataLength, 40);

  // Convert Float32Array to Int16Array
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    wav.writeInt16LE(value, 44 + i * 2);
  }

  return wav;
}

// 生成音效
const moveSound = generateTone(440, 0.1); // A4, 100ms
const eatSound = generateTone(880, 0.2);  // A5, 200ms
const dieSound = generateTone(220, 0.5);  // A3, 500ms
const pauseSound = generateTone(660, 0.15); // E5, 150ms

// 保存音效文件
const soundsDir = join(__dirname, '../public/sounds');

writeFileSync(join(soundsDir, 'move.wav'), generateWAV(moveSound));
writeFileSync(join(soundsDir, 'eat.wav'), generateWAV(eatSound));
writeFileSync(join(soundsDir, 'die.wav'), generateWAV(dieSound));
writeFileSync(join(soundsDir, 'pause.wav'), generateWAV(pauseSound)); 