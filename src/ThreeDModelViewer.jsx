import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useRef, useEffect } from 'react';

const ThreeDModelViewer = () => {
  const containerRef = useRef(null);
  const modelRef = useRef(null); // مرجع لتخزين النموذج
  const isDragging = useRef(false); // تتبع حالة السحب
  const previousMousePosition = useRef({ x: 0, y: 0 }); // حفظ موقع الماوس السابق
  const mousePosition = useRef({ x: 0, y: 0 }); // حفظ موقع الماوس الحالي

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 70); // وضع الكاميرا قريبًا

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // تمكين التخميد
    controls.dampingFactor = 0.1; // عامل التخميد
    controls.screenSpacePanning = false; // منع الحركة الأفقي
    controls.maxPolarAngle = Math.PI / 2; // الحد من زاوية الدوران العمودية
    controls.target.set(0, 1, 0); // ضبط الهدف ليكون في المنتصف
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // ضوء بيئي
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10); // تغيير موقع الضوء
    scene.add(directionalLight);

 
    const loader = new GLTFLoader();
    loader.load(
      "/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model; // تخزين النموذج في المرجع

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += 0.5; // رفع النموذج لأعلى قليلاً
        model.scale.set(0.5, 0.5, 0.5); // تعديل مقياس النموذج ليظهر بشكل أكبر

        scene.add(model);
        
        // تحديث الهدف في التحكم بعد إضافة النموذج
        controls.target.copy(center);
        controls.update();
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        alert('Error loading model: ' + error.message); // عرض رسالة خطأ
      }
    );

    const handleResize = () => {
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // جعل النموذج يدور حول المحور Y بناءً على حركة الماوس
      if (modelRef.current && isDragging.current) {
        const deltaX = previousMousePosition.current.x - mousePosition.current.x; // حساب الفرق X
        modelRef.current.rotation.y += deltaX * 0.01; // ضبط سرعة الدوران
        previousMousePosition.current = { ...mousePosition.current }; // تحديث موقع الماوس
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onMouseDown = (event) => {
      isDragging.current = true; // بدء السحب
      previousMousePosition.current = { x: event.clientX, y: event.clientY }; // حفظ موقع الماوس
      mousePosition.current = { x: event.clientX, y: event.clientY }; // حفظ موقع الماوس الحالي
    };

    const onMouseMove = (event) => {
      if (isDragging.current) {
        mousePosition.current = { x: event.clientX, y: event.clientY }; // تحديث موقع الماوس الحالي
      }
    };

    const onMouseUp = () => {
      isDragging.current = false; // إيقاف السحب
    };

    // إضافة أحداث الماوس
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'lightgray', // لإظهار الـ div
      }}
    />
  );
};

export default ThreeDModelViewer;
