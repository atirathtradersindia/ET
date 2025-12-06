// src/components/Hero.jsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Your 9 partner images
import img1 from '../assets/partners/Atirath_Industries.png';
import img2 from '../assets/partners/Atirath.png';
import img3 from '../assets/partners/Dubai.png';
import img4 from '../assets/partners/Oman.png';
import img5 from '../assets/partners/Royalone.png';
import img6 from '../assets/partners/Siea.png';
import img7 from '../assets/partners/Tyago.png';
import img8 from '../assets/partners/metas.jpg';
import img9 from '../assets/partners/Sugana.png';

const Hero = ({ showInnovation }) => {
  const canvasRef = useRef();
  const labelRef = useRef();
  const animationRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    const updateRendererSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    updateRendererSize();

    // Globe
    const geometry = new THREE.SphereGeometry(2.5, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0000ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleMat = new THREE.PointsMaterial({ color: 0x39ff14, size: 0.02 });
    const particles = new Float32Array(5000 * 3);
    for (let i = 0; i < particles.length; i += 3) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * Math.PI;
      const r = 3;
      particles[i] = r * Math.sin(phi) * Math.cos(theta);
      particles[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particles[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Lights
    const light = new THREE.PointLight(0x39ff14, 2.5);
    light.position.set(5, 5, 5);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x0000ffff, 0.3);
    scene.add(ambientLight);

    camera.position.z = 5;

    // Country markers
    const countries = [
      { lat: 51.5, lon: -0.1, name: "United Kingdom" },
      { lat: 40.7, lon: -74.0, name: "United States" },
      { lat: 28.6, lon: 77.2, name: "India" },
      { lat: 25.2, lon: 55.3, name: "UAE" },
      { lat: 1.3, lon: 103.8, name: "Singapore" },
      { lat: 35.6, lon: 139.7, name: "Japan" },
      { lat: -33.9, lon: 151.2, name: "Australia" },
    ];

    const markers = [];
    countries.forEach((c) => {
      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lon + 180) * (Math.PI / 180);
      const radius = 2.6;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const markerGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      marker.userData = { name: c.name };
      scene.add(marker);
      markers.push(marker);
    });

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      particleSystem.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', updateRendererSize);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      if (!canvasRef.current || !labelRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers);

      if (intersects.length > 0) {
        labelRef.current.style.display = 'block';
        labelRef.current.style.left = event.clientX + 15 + 'px';
        labelRef.current.style.top = event.clientY - 10 + 'px';
        labelRef.current.textContent = intersects[0].object.userData.name;
      } else {
        labelRef.current.style.display = 'none';
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', updateRendererSize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationRef.current);
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      markers.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      renderer.dispose();
    };
  }, []);

  const handleDiscoverInnovations = (e) => {
    e.preventDefault();
    showInnovation();
  };

  const scrollImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

  return (
    <section className="relative overflow-hidden text-white text-center min-h-screen flex flex-col justify-center bg-black/30">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        autoPlay loop muted playsInline
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-global-logistics-network-abstract-45878-small.mp4" type="video/mp4" />
      </video>

      {/* 3D Globe Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70 -z-5" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60 -z-4"></div>

      {/* Tooltip */}
      <div ref={labelRef} className="absolute hidden z-50 bg-black/70 text-secondary px-4 py-2 rounded-lg border border-secondary text-shadow-neon pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 md:pt-40 lg:pt-48 pb-32">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-shadow-black leading-tight">
          Revolutionizing Global Supply Chains<br />
          <span className="text-secondary">with Futuristic Solutions</span>
        </h1>
        <p className="text-lg md:text-2xl max-w-4xl mx-auto mb-12 text-white/90 font-light">
          Exclusive Traders delivers cutting-edge import/export and warehousing services, powered by AI and blockchain for unparalleled efficiency and transparency across the UK and globally.
        </p>
        <button
          onClick={handleDiscoverInnovations}
          className="px-12 py-5 bg-secondary text-dark text-xl font-bold rounded-full hover:bg-accent transition-all duration-300 shadow-neon transform hover:scale-105"
        >
          Discover Our Innovations
        </button>
      </div>
      {/* TRUSTED PARTNERS – NOW IN NORMAL FLOW */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-sm py-12 border-t border-white/10">
        <h3 className="text-center text-white/80 text-sm md:text-lg font-semibold mb-8 tracking-widest">
          TRUSTED PARTNERS
        </h3>
        <div className="overflow-hidden max-w-7xl mx-auto px-8">
          <div className="flex animate-marquee-infinite gap-10 md:gap-16">
            {[...scrollImages, ...scrollImages].map((img, i) => (
              <div key={i} className="flex-shrink-0">
                <img
                  src={img}
                  alt="Partner logo"
                  className="h-12 sm:h-14 md:h-20 lg:h-24 w-auto object-contain drop-shadow-2xl brightness-90 hover:brightness-110 transition-all duration-300"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;