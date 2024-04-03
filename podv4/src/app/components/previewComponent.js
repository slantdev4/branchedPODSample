'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PreviewService } from '../services/previewService';

const GRID_SIZE = 220; // in mm
const LIMIT_DIMENSIONS_MM = { length: 220, width: 220, height: 310 }; // in mm

const PreviewComponent = ({ fileURL, onExceedsLimit, onError }) => {
  const previewRef = useRef(null);
  const previewService = useRef(new PreviewService()).current;
  const scene = useRef(new THREE.Scene()).current;
  const camera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true })).current;
  const meshRef = useRef(null);
  const gridHelperRef = useRef(null);
  const controlsRef = useRef(null);
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 0 });
  const [modelLoaded, setModelLoaded] = useState(false);
  const [exceedsLimit, setExceedsLimit] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (previewRef.current) {
      initializeScene();

    }
  }, []);

  useEffect(() => {
    if (modelLoaded) {
      fitCameraToObject(meshRef.current);
      updateGrid();
      updateDimensions();
    }
  }, [modelLoaded]);


  useEffect(() => {
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    loadModel(fileURL);
  }, [fileURL]);
  const initializeScene = () => {
    renderer.setSize(600, 400); // Fixed size
    previewRef.current.appendChild(renderer.domElement);
    camera.current.position.z = 500;
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    // Set the background color to white
    renderer.setClearColor(0xf0f0f0); // A slightly darker white color


    controlsRef.current = new OrbitControls(camera.current, renderer.domElement);
    animate();
  };

  const loadModel = async (url) => {
    const fileExtension = url.split('.').pop().split('?')[0].toLowerCase();
    try {
      const geometry = await previewService.loadModel(url, fileExtension);

      if (geometry) {
        const material = new THREE.MeshStandardMaterial({ color: 0xb3b3b3 });
        meshRef.current = new THREE.Mesh(geometry, material);

        let boundingBox = new THREE.Box3().setFromObject(meshRef.current);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        checkDimensions(size);

        meshRef.current.rotation.x = Math.PI / 2;
        meshRef.current.updateMatrixWorld();
        const worldDir = new THREE.Vector3();
        meshRef.current.getWorldDirection(worldDir);
        if (worldDir.y < 0) {
          meshRef.current.rotation.x += Math.PI;
        }

        boundingBox = new THREE.Box3().setFromObject(meshRef.current);
        boundingBox.getCenter(center);
        boundingBox.getSize(size);

        checkDimensions(size);

        meshRef.current.position.copy(center).multiplyScalar(-1);
        meshRef.current.position.y += size.y / 2;

        scene.add(meshRef.current);
        setModelLoaded(true);
      } else {
        throw new Error('Invalid file: Could not load the 3D model from the provided file.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setExceedsLimit(true);
    }
  };

  const fitCameraToObject = (object, offset = 2) => {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.current.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

    camera.current.position.set(center.x, size.y / 2, cameraZ * offset);
    camera.current.lookAt(center.add(new THREE.Vector3(0, size.y / 2, 0)));

    if (controlsRef.current) {
      controlsRef.current.target = center;
    }

    camera.current.updateProjectionMatrix();
  };

  const animate = () => {
    requestAnimationFrame(animate);
    controlsRef.current.update();
    renderer.render(scene, camera.current);
  };

  const updateGrid = () => {
    if (gridHelperRef.current) {
      scene.remove(gridHelperRef.current);
    }

    const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE);
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;
  };

  const updateDimensions = () => {
    const boundingBox = new THREE.Box3().setFromObject(meshRef.current);
    const size = boundingBox.getSize(new THREE.Vector3());

    if (size.x === 0 || size.y === 0 || size.z === 0) {
      setError('Invalid model: The model dimensions are zero.');
      return;
    }

    setDimensions({
      length: parseFloat(size.x.toFixed(2)),
      width: parseFloat(size.y.toFixed(2)),
      height: parseFloat(size.z.toFixed(2)),
    });

    const modelExceedsLimit =
      size.x > LIMIT_DIMENSIONS_MM.length ||
      size.y > LIMIT_DIMENSIONS_MM.width ||
      size.z > LIMIT_DIMENSIONS_MM.height;

    setExceedsLimit(modelExceedsLimit);
  };

  const checkDimensions = (size) => {
    if (size.x === 0 || size.y === 0 || size.z === 0) {
      setError('Invalid model: The model dimensions are zero.');
      return;
    }

    setDimensions({
      length: parseFloat(size.x.toFixed(2)),
      width: parseFloat(size.y.toFixed(2)),
      height: parseFloat(size.z.toFixed(2)),
    });

    const modelExceedsLimit =
      size.x > LIMIT_DIMENSIONS_MM.length ||
      size.y > LIMIT_DIMENSIONS_MM.width ||
      size.z > LIMIT_DIMENSIONS_MM.height;

    if (modelExceedsLimit) {
      setError(`Model dimensions exceed our limit of ${LIMIT_DIMENSIONS_MM.length} (L) x ${LIMIT_DIMENSIONS_MM.width} (W) x ${LIMIT_DIMENSIONS_MM.height} (H) mm. Please choose a smaller model.`);
    }
  };

  const setError = (message) => {
    setErrorMessage(message);
    setExceedsLimit(true);
  };


  const resizePreview = (width, height) => {
    setPreviewSize({ width, height });
    renderer.setSize(width, height);
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();
  };

  const increasePreviewSize = () => {
    const newWidth = Math.min(previewSize.width + 100, window.innerWidth);
    const newHeight = Math.min(previewSize.height + 100, window.innerHeight);
    resizePreview(newWidth, newHeight);
    console.log(`Increased size: ${newWidth}x${newHeight}`);
  };

  const decreasePreviewSize = () => {
    const newWidth = Math.max(previewSize.width - 200, 150);
    const newHeight = Math.max(previewSize.height - 200, 150);
    resizePreview(newWidth, newHeight);
    console.log(`Decreased size: ${newWidth}x${newHeight}`);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="" ref={previewRef}></div>
      </div>
    </div>
  );
};

export default PreviewComponent;



