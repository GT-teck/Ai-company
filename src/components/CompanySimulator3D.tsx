import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AgentEntity, CompanyState, SimulationTime, ExpansionTier } from '../types/simulator';

interface CompanySimulator3DProps {
  agents: AgentEntity[];
  company: CompanyState;
  time: SimulationTime;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  followCamera: boolean;
}

export const CompanySimulator3D: React.FC<CompanySimulator3DProps> = ({
  agents,
  company,
  time,
  selectedAgentId,
  onSelectAgent,
  followCamera,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // 3D Meshes map
  const agentMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const companyBuildingGroupRef = useRef<THREE.Group | null>(null);
  const vehiclesRef = useRef<{ mesh: THREE.Group; speed: number; lane: 'x' | 'z'; dir: number; pos: number }[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Camera control state
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraAngleRef = useRef<number>(Math.PI / 4); // 45 degree isometric angle
  const cameraDistanceRef = useRef<number>(42);
  const cameraPitchRef = useRef<number>(Math.PI / 3.2); // angled look-down
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Raycaster for clicking agents
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mousePosRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Setup Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    mountRef.current.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.2);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    dirLightRef.current = dirLight;
    dirLight.position.set(40, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Build Static City Environment
    buildCityEnvironment(scene);

    // Build Dynamic Company Building
    rebuildCompanyBuilding(scene, company.tier);

    // Build Floating Particle Field
    buildParticles(scene);

    // Mouse & Keyboard Event Handlers
    const domElem = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - prevMouseRef.current.x;
        const dy = e.clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };

        if (e.buttons === 2 || e.shiftKey) {
          // Orbit angle
          cameraAngleRef.current -= dx * 0.008;
          cameraPitchRef.current = Math.max(0.2, Math.min(Math.PI / 2.2, cameraPitchRef.current + dy * 0.005));
        } else {
          // Pan camera
          const sin = Math.sin(cameraAngleRef.current);
          const cos = Math.cos(cameraAngleRef.current);
          cameraTargetRef.current.x += (-dx * cos - dy * sin) * 0.05;
          cameraTargetRef.current.z += (dx * sin - dy * cos) * 0.05;
        }
        updateCameraPosition();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Check click raycast
      const rect = domElem.getBoundingClientRect();
      mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mousePosRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      let clickedAgentId: string | null = null;
      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData && curr.userData.agentId) {
            clickedAgentId = curr.userData.agentId;
            break;
          }
          curr = curr.parent;
        }
        if (clickedAgentId) break;
      }

      if (clickedAgentId) {
        onSelectAgent(clickedAgentId);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(15, Math.min(95, cameraDistanceRef.current + e.deltaY * 0.04));
      updateCameraPosition();
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    domElem.addEventListener('contextmenu', handleContextMenu);

    // Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Animate Vehicles on City Roads
      vehiclesRef.current.forEach((v) => {
        v.pos += v.speed * v.dir * (time.speed > 0 ? time.speed : 1);
        if (v.pos > 35) v.pos = -35;
        if (v.pos < -35) v.pos = 35;

        if (v.lane === 'x') {
          v.mesh.position.x = v.pos;
        } else {
          v.mesh.position.z = v.pos;
        }
      });

      // Animate 3D Agents (Walking Bob, arm swing, role badges)
      agentMeshesRef.current.forEach((group, agentId) => {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) return;

        // Smooth position interpolation
        group.position.lerp(new THREE.Vector3(agent.position.x, agent.position.y, agent.position.z), 0.15);

        // Walking leg swing & bob
        const isWalking = agent.currentAction === 'walking' || agent.currentAction === 'stocking' || agent.currentAction === 'shopping';
        const leftLeg = group.getObjectByName('leftLeg');
        const rightLeg = group.getObjectByName('rightLeg');
        const leftArm = group.getObjectByName('leftArm');
        const rightArm = group.getObjectByName('rightArm');
        const bodyMesh = group.getObjectByName('body');

        if (isWalking) {
          const stride = Math.sin(elapsedTime * 10 * (time.speed || 1));
          if (leftLeg) leftLeg.rotation.x = stride * 0.6;
          if (rightLeg) rightLeg.rotation.x = -stride * 0.6;
          if (leftArm) leftArm.rotation.x = -stride * 0.5;
          if (rightArm) rightArm.rotation.x = stride * 0.5;
          if (bodyMesh) bodyMesh.position.y = 0.9 + Math.abs(Math.sin(elapsedTime * 10)) * 0.08;
        } else {
          if (leftLeg) leftLeg.rotation.x = 0;
          if (rightLeg) rightLeg.rotation.x = 0;
          if (leftArm) leftArm.rotation.x = 0;
          if (rightArm) rightArm.rotation.x = 0;
          if (bodyMesh) bodyMesh.position.y = 0.9;
        }

        // Selection ring halo
        const halo = group.getObjectByName('selectionHalo');
        if (halo) {
          halo.visible = agent.id === selectedAgentId;
          if (halo.visible) halo.rotation.z += 0.03;
        }
      });

      // Follow Camera onto selected agent
      if (followCamera && selectedAgentId) {
        const targetAgent = agents.find((a) => a.id === selectedAgentId);
        if (targetAgent) {
          cameraTargetRef.current.lerp(new THREE.Vector3(targetAgent.position.x, 0, targetAgent.position.z), 0.1);
          updateCameraPosition();
        }
      }

      // Day/Night Lighting updates
      if (dirLightRef.current && ambientLightRef.current) {
        const hour = time.hour + time.minute / 60;
        let sunIntensity = 2.0;
        let skyColor = 0x0a0f1d;

        if (hour >= 6 && hour < 9) {
          // Dawn
          sunIntensity = 1.4;
          skyColor = 0x312e81;
          dirLightRef.current.color.setHex(0xfde047);
        } else if (hour >= 9 && hour < 17) {
          // Daytime
          sunIntensity = 2.2;
          skyColor = 0x0369a1;
          dirLightRef.current.color.setHex(0xfffbeb);
        } else if (hour >= 17 && hour < 20) {
          // Sunset
          sunIntensity = 1.6;
          skyColor = 0x831843;
          dirLightRef.current.color.setHex(0xf97316);
        } else {
          // Night
          sunIntensity = 0.4;
          skyColor = 0x030712;
          dirLightRef.current.color.setHex(0x38bdf8);
        }

        dirLightRef.current.intensity = sunIntensity;
        scene.background = new THREE.Color(skyColor);
        scene.fog = new THREE.FogExp2(skyColor, 0.008);
      }

      // Rotate particle field
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
      domElem.removeEventListener('contextmenu', handleContextMenu);
      renderer.dispose();
    };
  }, []);

  // Update camera position helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const dist = cameraDistanceRef.current;
    const angle = cameraAngleRef.current;
    const pitch = cameraPitchRef.current;
    const target = cameraTargetRef.current;

    const x = target.x + dist * Math.cos(angle) * Math.cos(pitch);
    const y = target.y + dist * Math.sin(pitch);
    const z = target.z + dist * Math.sin(angle) * Math.cos(pitch);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  };

  // Synchronize dynamic 3D agent meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Track active agent IDs
    const currentAgentIds = new Set(agents.map((a) => a.id));

    // Remove deleted agents
    agentMeshesRef.current.forEach((mesh, id) => {
      if (!currentAgentIds.has(id)) {
        scene.remove(mesh);
        agentMeshesRef.current.delete(id);
      }
    });

    // Create or update meshes
    agents.forEach((agent) => {
      let group = agentMeshesRef.current.get(agent.id);
      if (!group) {
        group = createAgentMesh(agent);
        group.userData = { agentId: agent.id };
        scene.add(group);
        agentMeshesRef.current.set(agent.id, group);
      }
    });
  }, [agents]);

  // Rebuild building on expansion tier change
  useEffect(() => {
    if (sceneRef.current) {
      rebuildCompanyBuilding(sceneRef.current, company.tier);
    }
  }, [company.tier]);

  // Helper: Build City Environment (Roads, Houses, Logistics Depot, Stock Exchange, Park)
  const buildCityEnvironment = (scene: THREE.Scene) => {
    // 1. Ground Grass Canvas
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // 2. Asphalt Roads Grid
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    // Main Avenue (X-axis)
    const roadXGeo = new THREE.PlaneGeometry(90, 6);
    const roadX = new THREE.Mesh(roadXGeo, roadMat);
    roadX.rotation.x = -Math.PI / 2;
    roadX.position.set(0, 0, 8);
    roadX.receiveShadow = true;
    scene.add(roadX);

    // Main Avenue (Z-axis)
    const roadZGeo = new THREE.PlaneGeometry(6, 90);
    const roadZ = new THREE.Mesh(roadZGeo, roadMat);
    roadZ.rotation.x = -Math.PI / 2;
    roadZ.position.set(-10, 0, 0);
    roadZ.receiveShadow = true;
    scene.add(roadZ);

    // Secondary Cross Road
    const roadZ2 = new THREE.Mesh(roadZGeo, roadMat);
    roadZ2.rotation.x = -Math.PI / 2;
    roadZ2.position.set(16, 0, 0);
    roadZ2.receiveShadow = true;
    scene.add(roadZ2);

    // Road Markings (Dashed White Lines)
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let i = -40; i <= 40; i += 4) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.3), dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i, 0.02, 8);
      scene.add(dash);

      const dashZ = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), dashMat);
      dashZ.rotation.x = -Math.PI / 2;
      dashZ.position.set(-10, 0.02, i);
      scene.add(dashZ);
    }

    // 3. Residential Neighborhood (North-East)
    const housePositions = [
      { x: 26, z: -16, color: 0x38bdf8, h: 4.5 },
      { x: 34, z: -16, color: 0x818cf8, h: 5.5 },
      { x: 26, z: -6, color: 0xf43f5e, h: 4.0 },
      { x: 34, z: -6, color: 0x34d399, h: 6.0 },
      { x: 26, z: 18, color: 0xfbbf24, h: 4.2 },
      { x: 34, z: 18, color: 0xa78bfa, h: 5.0 },
    ];

    housePositions.forEach((hp) => {
      const houseGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(6, hp.h, 6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      );
      body.position.y = hp.h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      houseGroup.add(body);

      // Roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(5, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: hp.color, roughness: 0.3 })
      );
      roof.position.y = hp.h + 1.25;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      houseGroup.add(roof);

      // Glowing Windows
      for (let wy = 1.5; wy < hp.h; wy += 1.8) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(1.2, 1),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        win.position.set(0, wy, 3.01);
        houseGroup.add(win);
      }

      houseGroup.position.set(hp.x, 0, hp.z);
      scene.add(houseGroup);
    });

    // 4. Logistics Wholesale Warehouse (West)
    const warehouseGroup = new THREE.Group();
    const whBody = new THREE.Mesh(
      new THREE.BoxGeometry(14, 5.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    whBody.position.y = 2.75;
    whBody.castShadow = true;
    whBody.receiveShadow = true;
    warehouseGroup.add(whBody);

    // Warehouse Sign
    const whSign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 1.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.5 })
    );
    whSign.position.set(0, 4.5, 6.2);
    warehouseGroup.add(whSign);

    // Warehouse Roller Shutter
    const shutter = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2 })
    );
    shutter.position.set(0, 1.6, 6.02);
    warehouseGroup.add(shutter);

    warehouseGroup.position.set(-24, 0, -10);
    scene.add(warehouseGroup);

    // 5. Stock Exchange Building (South)
    const stockGroup = new THREE.Group();
    const stockBody = new THREE.Mesh(
      new THREE.BoxGeometry(12, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
    );
    stockBody.position.y = 5;
    stockBody.castShadow = true;
    stockBody.receiveShadow = true;
    stockGroup.add(stockBody);

    // Green Ticker Neon Ribbon
    const tickerRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(12.2, 0.8, 10.2),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    tickerRibbon.position.y = 6.5;
    stockGroup.add(tickerRibbon);

    stockGroup.position.set(-24, 0, 20);
    scene.add(stockGroup);

    // 6. Central City Park with Trees
    const parkGround = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.1, 10),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 })
    );
    parkGround.position.set(3, 0.05, -12);
    parkGround.receiveShadow = true;
    scene.add(parkGround);

    // Trees
    const treeCoords = [
      { x: 0, z: -10 },
      { x: 5, z: -14 },
      { x: 7, z: -9 },
      { x: -1, z: -14 },
    ];
    treeCoords.forEach((tc) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 2, 6),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      trunk.position.y = 1;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6, 1),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 })
      );
      foliage.position.y = 2.8;
      foliage.castShadow = true;
      tree.add(foliage);

      tree.position.set(tc.x, 0, tc.z);
      scene.add(tree);
    });

    // 7. City Vehicles
    vehiclesRef.current = [
      { mesh: createCarMesh(0x38bdf8), speed: 0.12, lane: 'x', dir: 1, pos: -20 },
      { mesh: createCarMesh(0xf43f5e), speed: 0.14, lane: 'x', dir: -1, pos: 25 },
      { mesh: createCarMesh(0xfbbf24), speed: 0.10, lane: 'z', dir: 1, pos: -15 },
      { mesh: createCarMesh(0xa855f7), speed: 0.13, lane: 'z', dir: -1, pos: 30 },
    ];

    vehiclesRef.current.forEach((v) => {
      if (v.lane === 'x') {
        v.mesh.position.set(v.pos, 0.4, 8);
        v.mesh.rotation.y = v.dir > 0 ? 0 : Math.PI;
      } else {
        v.mesh.position.set(-10, 0.4, v.pos);
        v.mesh.rotation.y = v.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      }
      scene.add(v.mesh);
    });
  };

  // Helper: Build or Upgrade Company 3D Building based on tier
  const rebuildCompanyBuilding = (scene: THREE.Scene, tier: ExpansionTier) => {
    if (companyBuildingGroupRef.current) {
      scene.remove(companyBuildingGroupRef.current);
    }

    const group = new THREE.Group();
    companyBuildingGroupRef.current = group;

    const baseWidth = 10 + (tier - 1) * 2.5;
    const baseHeight = 4 + (tier - 1) * 3.5;
    const baseDepth = 10 + (tier - 1) * 2;

    // Main Structure
    const buildingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.8,
      })
    );
    buildingMesh.position.y = baseHeight / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    group.add(buildingMesh);

    // Glass Facade Windows
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    const facade = new THREE.Mesh(
      new THREE.PlaneGeometry(baseWidth - 1, baseHeight - 1),
      glassMat
    );
    facade.position.set(0, baseHeight / 2, baseDepth / 2 + 0.02);
    group.add(facade);

    // Illuminated Corporate Signboard on Top
    const signBox = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth * 0.8, 1.2, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
      })
    );
    signBox.position.set(0, baseHeight + 0.6, 0);
    group.add(signBox);

    // Solar panels on roof
    const solar = new THREE.Mesh(
      new THREE.PlaneGeometry(baseWidth * 0.6, baseDepth * 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 })
    );
    solar.rotation.x = -Math.PI / 2;
    solar.position.set(0, baseHeight + 0.05, 0);
    group.add(solar);

    // Entrance Awning
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.4, 2),
      new THREE.MeshStandardMaterial({ color: 0x6366f1 })
    );
    awning.position.set(0, 2.5, baseDepth / 2 + 1);
    group.add(awning);

    group.position.set(3, 0, 0);
    scene.add(group);
  };

  // Helper: Create stylized low-poly vehicle
  const createCarMesh = (color: number): THREE.Group => {
    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.9, 1.6),
      new THREE.MeshStandardMaterial({ color, roughness: 0.3 })
    );
    body.castShadow = true;
    car.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.7, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 })
    );
    cabin.position.set(-0.2, 0.7, 0);
    car.add(cabin);

    // Headlights
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.2, 1.2),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    light.position.set(1.6, 0, 0);
    car.add(light);

    return car;
  };

  // Helper: Create 3D Agent character mesh
  const createAgentMesh = (agent: AgentEntity): THREE.Group => {
    const agentGroup = new THREE.Group();

    // Body / Torso
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(agent.avatarColor),
      roughness: 0.4,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.name = 'body';
    body.position.y = 0.9;
    body.castShadow = true;
    agentGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.name = 'head';
    head.position.y = 1.65;
    head.castShadow = true;
    agentGroup.add(head);

    // Left & Right Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.name = 'leftLeg';
    leftLeg.position.set(-0.18, 0.35, 0);
    leftLeg.castShadow = true;
    agentGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.name = 'rightLeg';
    rightLeg.position.set(0.18, 0.35, 0);
    rightLeg.castShadow = true;
    agentGroup.add(rightLeg);

    // Left & Right Arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6);
    const armMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(agent.avatarColor) });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.name = 'leftArm';
    leftArm.position.set(-0.48, 0.95, 0);
    leftArm.castShadow = true;
    agentGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.name = 'rightArm';
    rightArm.position.set(0.48, 0.95, 0);
    rightArm.castShadow = true;
    agentGroup.add(rightArm);

    // Selection Halo Disc on Ground
    const haloGeo = new THREE.RingGeometry(0.6, 0.8, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.name = 'selectionHalo';
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    halo.visible = false;
    agentGroup.add(halo);

    agentGroup.position.set(agent.position.x, agent.position.y, agent.position.z);
    return agentGroup;
  };

  // Helper: Background GPU particle ambiance
  const buildParticles = (scene: THREE.Scene) => {
    const particleCount = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 120;
      pos[i + 1] = Math.random() * 35;
      pos[i + 2] = (Math.random() - 0.5) * 120;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.4,
    });

    const particles = new THREE.Points(geo, mat);
    particlesRef.current = particles;
    scene.add(particles);
  };

  // Camera Controls Bar Actions
  const resetCamera = () => {
    cameraTargetRef.current.set(0, 0, 0);
    cameraAngleRef.current = Math.PI / 4;
    cameraPitchRef.current = Math.PI / 3.2;
    cameraDistanceRef.current = 42;
    updateCameraPosition();
  };

  const zoomIn = () => {
    cameraDistanceRef.current = Math.max(15, cameraDistanceRef.current - 8);
    updateCameraPosition();
  };

  const zoomOut = () => {
    cameraDistanceRef.current = Math.min(95, cameraDistanceRef.current + 8);
    updateCameraPosition();
  };

  const setCameraPreset = (preset: 'store' | 'street' | 'birds' | 'ceo') => {
    if (preset === 'store') {
      cameraTargetRef.current.set(0, 1, 0);
      cameraAngleRef.current = Math.PI / 4;
      cameraPitchRef.current = Math.PI / 4;
      cameraDistanceRef.current = 24;
    } else if (preset === 'street') {
      cameraTargetRef.current.set(0, 0, 8);
      cameraAngleRef.current = 0;
      cameraPitchRef.current = 0.25;
      cameraDistanceRef.current = 28;
    } else if (preset === 'birds') {
      cameraTargetRef.current.set(0, 0, 0);
      cameraAngleRef.current = Math.PI / 4;
      cameraPitchRef.current = Math.PI / 2.3;
      cameraDistanceRef.current = 65;
    } else if (preset === 'ceo') {
      const founder = agents.find(a => a.role === 'founder') || agents[0];
      if (founder) {
        cameraTargetRef.current.set(founder.position.x, founder.position.y, founder.position.z);
        cameraAngleRef.current = Math.PI / 3;
        cameraPitchRef.current = Math.PI / 3.5;
        cameraDistanceRef.current = 18;
        onSelectAgent(founder.id);
      }
    }
    updateCameraPosition();
  };

  const latestExp = company.activeExperiments && company.activeExperiments.length > 0 
    ? company.activeExperiments[0] 
    : company.completedReports && company.completedReports.length > 0 
    ? company.completedReports[0] 
    : null;

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Ticker for Live Autonomous Trials */}
      {latestExp && (
        <div className="absolute top-4 left-4 z-20 max-w-md bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {latestExp.status === 'running' ? 'AI In-Flight Trial' : 'Latest AI Learning'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {latestExp.status === 'running' ? `${latestExp.progress}% Done` : 'Outcome Logged'}
            </span>
          </div>

          <div className="text-xs text-white font-bold leading-tight line-clamp-1">
            {latestExp.title}
          </div>

          <div className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            {latestExp.status === 'running' ? latestExp.dialogueSuggestion : latestExp.reportSummary}
          </div>
        </div>
      )}

      {/* Floating 3D Camera Controls Toolbar & Presets */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
        <button
          onClick={() => setCameraPreset('store')}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all"
          title="Store Floor View"
        >
          🏬 Store Floor
        </button>
        <button
          onClick={() => setCameraPreset('ceo')}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all"
          title="Follow Leader"
        >
          👤 CEO Cam
        </button>
        <button
          onClick={() => setCameraPreset('birds')}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all"
          title="Bird's Eye City"
        >
          🦅 City View
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          title="Zoom In"
        >
          ➕
        </button>
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          title="Zoom Out"
        >
          ➖
        </button>
        <button
          onClick={resetCamera}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-all"
          title="Reset Isometric View"
        >
          <span>📐 Reset</span>
        </button>
      </div>

      {/* Interactive Controls Overlay Badge */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 font-medium">
        <span>🖱️ <strong>Left Drag:</strong> Pan</span>
        <span className="text-slate-600">•</span>
        <span><strong>Right Drag:</strong> Orbit</span>
        <span className="text-slate-600">•</span>
        <span><strong>Scroll:</strong> Zoom</span>
        <span className="text-slate-600">•</span>
        <span><strong>Click Agent:</strong> Inspect & Skills</span>
      </div>
    </div>
  );
};
