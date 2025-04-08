import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const stations = ['Bến Thành', 'Ba Son', 'Văn Thánh', 'Thảo Điền', 'Suối Tiên'];

export default function App() {
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(80);
  const [currentStation, setCurrentStation] = useState('');
  const [nextStation, setNextStation] = useState(stations[1]);
  const [status, setStatus] = useState(['OK', 'OK', 'OK', 'OK']);

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('viet')));
    if (viVoice) utter.voice = viVoice;
    utter.lang = 'vi-VN';
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const handleVoiceInit = () => {
      window.speechSynthesis.getVoices(); // load voices
    };
    window.speechSynthesis.onvoiceschanged = handleVoiceInit;
    handleVoiceInit();

    const interval = setInterval(() => {
      const newSpeed = 80 + Math.floor(Math.random() * 20);
      setSpeed(newSpeed);
      setPosition((prev) => {
        const newPos = prev + newSpeed / 60;
        const segment = 100 / (stations.length - 1);
        const index = Math.floor(newPos / segment);
        if (index !== stations.indexOf(currentStation) && index < stations.length) {
          const curr = stations[index];
          const next = stations[index + 1] || 'Hết tuyến';
          setCurrentStation(curr);
          setNextStation(next);
          speak(`Đã tới ga ${curr}. Ga tiếp theo: ${next}`);
        }
        return Math.min(newPos, 100);
      });

      setStatus((prev) =>
        prev.map(() => {
          const types = ['OK', 'Nhiệt độ cao', 'Lỗi phanh', 'Rung động mạnh', 'Hỏng cảm biến'];
          return types[Math.floor(Math.random() * types.length)];
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Canvas style={{ width: '70vw', height: '100vh' }} camera={{ position: [0, 10, 30], fov: 50 }}>
        <ambientLight />
        <directionalLight position={[10, 10, 5]} />
        <OrbitControls />
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[100, 0.5, 1]} />
          <meshStandardMaterial color='gray' />
        </mesh>
        <group position={[-50 + position, 1, 0]}>
          {status.map((s, i) => (
            <mesh key={i} position={[i * 3, 0, 0]}>
              <boxGeometry args={[2.5, 1, 1]} />
              <meshStandardMaterial
                color={
                  s === 'OK' ? 'green' : s.includes('Lỗi') || s.includes('Hỏng') ? 'red' : 'yellow'
                }
              />
            </mesh>
          ))}
        </group>
      </Canvas>
      <div style={{ padding: 20, width: '30vw' }}>
        <h2>Metro Twin Demo</h2>
        <p><strong>Tốc độ:</strong> {speed} km/h</p>
        <p><strong>Ga hiện tại:</strong> {currentStation}</p>
        <p><strong>Ga kế tiếp:</strong> {nextStation}</p>
        <h4>Trạng thái kỹ thuật:</h4>
        <ul>
          {status.map((s, i) => (
            <li key={i}>Toa {i + 1}: {s}</li>
          ))}
        </ul>
        <p style={{ marginTop: '2em', fontStyle: 'italic' }}>Powered by Silversea Media</p>
      </div>
    </div>
  );
}
