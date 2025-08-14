import React, { useState, useRef, useEffect } from 'react';

// Assets Imports
import FlexiTeacher from '../assets/All Flexi Poses/PNG/Flexi_Teacher.png';
import FlexiPoint from '../assets/All Flexi Poses/PNG/Flexi_Point.png';
import FlexiThumbsUp from '../assets/All Flexi Poses/PNG/Flexi_ThumbsUp.png';
import FlexiStars from '../assets/All Flexi Poses/PNG/Flexi_Stars.png';
import FlexiExcited from '../assets/All Flexi Poses/PNG/Flexi_Excited.png';
import FlexiTelescope from '../assets/All Flexi Poses/PNG/Flexi_Telescope.png';

// UI Components Imports
import { Container } from './ui/reused-ui/Container.jsx'
import { FlexiText } from './ui/reused-ui/FlexiText.jsx'
import { GlowButton } from './ui/reused-ui/GlowButton.jsx'
import { MultiGlowButton } from './ui/reused-ui/MultiGlowButton.jsx'

// UI Animation Imports
import './ui/reused-animations/fade.css';
import './ui/reused-animations/scale.css';
import './ui/reused-animations/glow.css';

import { DndContext, useDraggable, useDroppable, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

function RenderObjectAppearance({ type, size, color, isSubmerged = false }) {
	const getBaseShape = () => {
		if (type === 'apple') {
			return (
				<div className="rounded-full relative" style={{ width: size, height: size, backgroundColor: color }}>
					<div className="absolute" style={{ top: '-5%', left: '60%', width: 12, height: 10, backgroundColor: '#22c55e', borderRadius: '9999px', transform: 'rotate(5deg)' }}></div>
					<div className="absolute" style={{ top: '15%', left: '20%', width: 15, height: 15, backgroundColor: '#fca5a5', borderRadius: '9999px', opacity: 0.6 }}></div>
				</div>
			);
		}
		if (type === 'orange') {
			return (
				<div className="rounded-full relative" style={{ width: size, height: size, backgroundColor: color }}>
					{/* Orange peel texture dots */}
					<div className="absolute" style={{ top: '10%', left: '15%', width: 3, height: 3, backgroundColor: '#ea580c', borderRadius: '50%', opacity: 0.7 }}></div>
					<div className="absolute" style={{ top: '25%', left: '75%', width: 2, height: 2, backgroundColor: '#ea580c', borderRadius: '50%', opacity: 0.7 }}></div>
					<div className="absolute" style={{ top: '65%', left: '30%', width: 3, height: 3, backgroundColor: '#ea580c', borderRadius: '50%', opacity: 0.7 }}></div>
					<div className="absolute" style={{ top: '45%', left: '65%', width: 2, height: 2, backgroundColor: '#ea580c', borderRadius: '50%', opacity: 0.7 }}></div>
					<div className="absolute" style={{ top: '75%', left: '70%', width: 2, height: 2, backgroundColor: '#ea580c', borderRadius: '50%', opacity: 0.7 }}></div>
					{/* Small green stem spot */}
					<div className="absolute" style={{ top: '-3%', left: '45%', width: 8, height: 6, backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
					{/* Highlight */}
					<div className="absolute" style={{ top: '20%', left: '25%', width: 12, height: 12, backgroundColor: '#fed7aa', borderRadius: '50%', opacity: 0.6 }}></div>
				</div>
			);
		}
		if (type === 'ball') {
			return (
				<div className="rounded-full" style={{ width: size, height: size, background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${color} 60%)`, opacity: 1 }}></div>
			);
		}
		if (type === 'square') {
			const cubeColors = [
				'#ef4444', '#f97316', '#eab308', // red, orange, yellow
				'#22c55e', '#3b82f6', '#ef4444', // green, blue, red  
				'#ef4444', '#ffffff', '#f97316'  // pink, white, orange
			];
			
			return (
				<div 
					style={{ 
						width: size, 
						height: size, 
						backgroundColor: '#000000', 
						borderRadius: 4,
						padding: 2,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gridTemplateRows: 'repeat(3, 1fr)',
						gap: 2
					}}
				>
					{cubeColors.map((squareColor, index) => (
						<div
							key={index}
							style={{
								backgroundColor: squareColor,
								borderRadius: 2,
								width: '100%',
								height: '100%'
							}}
						/>
					))}
				</div>
			);
		}
		if (type === 'rock') {
			return (
				<div className="" style={{ width: size, height: size * 0.7, backgroundColor: color, borderRadius: '40% 50% 35% 55% / 50% 40% 60% 45%' }}></div>
			);
		}
		return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 8 }}></div>;
	};

	if (isSubmerged) {
		return (
			<div className="relative">
				{getBaseShape()}
				{/* Underwater blue tint overlay */}
				<div 
					className="absolute inset-0 pointer-events-none"
					style={{
						backgroundColor: '#3b82f6',
						opacity: 0.4,
						borderRadius: type === 'apple' || type === 'orange' || type === 'ball' ? '50%' : 
									 type === 'square' ? '4px' :
									 type === 'rock' ? '40% 50% 35% 55% / 50% 40% 60% 45%' : '8px',
						mixBlendMode: 'multiply'
					}}
				/>
				{/* Subtle water shimmer effect */}
				<div 
					className="absolute inset-0 pointer-events-none"
					style={{
						background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
						borderRadius: type === 'apple' || type === 'orange' || type === 'ball' ? '50%' : 
									 type === 'square' ? '4px' :
									 type === 'rock' ? '40% 50% 35% 55% / 50% 40% 60% 45%' : '8px'
					}}
				/>
			</div>
		);
	}

	return getBaseShape();
}

function DraggableItem({ id, def }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
	const leftValue = typeof def.startX === 'string'
		? def.startX
		: (def.startXPercent != null ? `${def.startXPercent}%` : (def.startX || 0));
	const base = { 
		position: 'absolute', 
		left: leftValue, 
		top: def.startY || 0,
		transform: def.deltaX ? `translateX(${def.deltaX}px)` : undefined
	};
	const style = transform ? { ...base, transform: `translate3d(${transform.x}px, ${transform.y}px, 0) ${def.deltaX ? `translateX(${def.deltaX}px)` : ''}` } : base;
	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={style} className="cursor-grab active:cursor-grabbing">
			<RenderObjectAppearance type={def.type} size={def.size} color={def.color} />
		</div>
	);
}

const WaterDisplacementV2 = () => {
	// Simple object catalog (extendable)
	const objectCatalog = {
		'apple-1': { type: 'apple', volume: 20, size: 50, color: '#ef4444', startX: '160%', startY: 170 },
		'orange-1': { type: 'orange', volume: 22, size: 48, color: '#f97316', startX: '20%', startY: 170 },
		'ball-1': { type: 'ball', volume: 15, size: 40, color: '#f59e0b', startX: '40%', startY: 190 },
		'cube-1': { type: 'square', volume: 20, size: 45, color: '#3b82f6', startX: '10%', startY: 188 },
		'rock-1': { type: 'rock', volume: 15, size: 55, color: '#6b7280', startX: '140%', startY: 190 },
		'ball-2': { type: 'ball', volume: 8, size: 28, color: '#22d3ee', startX: '175%', startY: 205 }
	};
	const allObjectIds = Object.keys(objectCatalog);

	// State Variables
	const [currentVolume, setCurrentVolume] = useState(200);
	const [waterTopPosition, setWaterTopPosition] = useState(-48.5);
	const [waterBodyPosition, setWaterBodyPosition] = useState(29);

	// Refs to latest water values for physics loop
	const waterBodyPositionRef = useRef(waterBodyPosition);
	useEffect(() => { waterBodyPositionRef.current = waterBodyPosition; }, [waterBodyPosition]);

	// DnD and physics state
	const sensors = useSensors(
		useSensor(PointerSensor, { 
			activationConstraint: { distance: 4 } 
		}),
		useSensor(MouseSensor, { 
			activationConstraint: { distance: 4 } 
		}),
		useSensor(TouchSensor, { 
			activationConstraint: { 
				distance: 4,
				tolerance: 5 // Additional tolerance for touch devices
			} 
		})
	);
	const { setNodeRef: setBeakerNodeRef } = useDroppable({ id: 'beaker' });
	const beakerRef = useRef(null);
	const [onShelfIds, setOnShelfIds] = useState(new Set(allObjectIds));
	
	// Objects that have been displaced from their original positions
	const [displacedObjects, setDisplacedObjects] = useState([]);
	
	// Objects currently inside the beaker (falling or resting)
	const [objectsInBeaker, setObjectsInBeaker] = useState([]);
	const objectsRef = useRef(objectsInBeaker);
	useEffect(() => { objectsRef.current = objectsInBeaker; }, [objectsInBeaker]);
	
	// Objects falling back to shelf - using same coordinate system as original objects
	const [fallingToShelf, setFallingToShelf] = useState([]);
	const fallingToShelfRef = useRef(fallingToShelf);
	useEffect(() => { fallingToShelfRef.current = fallingToShelf; }, [fallingToShelf]);
	
	const animRef = useRef(null);

	const startAnimation = () => {
		if (animRef.current) return;
		const gravity = 0.6;
		const tick = () => {
			const beaker = beakerRef.current;
			if (!beaker) { animRef.current = null; return; }
			const beakerHeight = beaker.clientHeight || 156;
			const bottomOffsetPx = beakerHeight * 0.145; // bottom-[14.5%]
			const waterSurfaceY = beakerHeight - bottomOffsetPx - (waterBodyPositionRef.current || 0);
			const restOffsetPx = 5; // raise resting position by ~5px

			let anyFalling = false;
			
			// Handle objects falling into beaker
			const curr = objectsRef.current;
			const next = curr.map(o => {
				if (o.state !== 'falling') return o;
				anyFalling = true;
				let vy = o.vy + gravity;
				let y = o.y + vy;
				// Displace water when entering
				if (!o.displaced && (y + o.size) >= waterSurfaceY) {
					const mlPerPixel = 3.85; // 600mL capacity / 156px height ≈ 3.85 mL per pixel
					const pixelDisplacement = o.volume / mlPerPixel;
					
					setCurrentVolume(prev => prev + o.volume);
					setWaterTopPosition(prev => prev + pixelDisplacement);
					setWaterBodyPosition(prev => Math.max(0, prev + pixelDisplacement));
					o.displaced = true;
				}
				// Rest all objects at the same bottom level (no stacking), raised slightly
				const groundY = beakerHeight - restOffsetPx - o.size;
				if (y >= groundY) {
					y = groundY;
					vy = 0;
					return { ...o, y, vy, state: 'rest' };
				}
				return { ...o, y, vy };
			});

			setObjectsInBeaker(next);
			objectsRef.current = next;
			
			// Handle objects falling back to shelf
			const currentShelf = fallingToShelfRef.current;
			const nextShelf = currentShelf.map(o => {
				if (o.state !== 'falling') return o;
				anyFalling = true;
				let vy = o.vy + gravity;
				let y = o.y + vy;
				
				// Get object definition to calculate height
				const objDef = objectCatalog[o.id];
				let objHeight = objDef?.size || 50;
				
				// Adjust height for rock (which has height = size * 0.7)
				if (objDef?.type === 'rock') {
					objHeight = objDef.size * 0.7;
				}
				
				// Calculate target Y position so bottom edge aligns at 220
				const targetTopY = o.targetY - objHeight;
				
				// Check if reached target Y position (aligned by bottom edge)
				if (y >= targetTopY) {
					y = targetTopY;
					vy = 0;
					// Add to displaced objects at the new position instead of original position
					const originalDef = objectCatalog[o.id];
					const displacedDef = {
						...originalDef,
						id: o.id,
						startX: o.leftValue,
						startY: y,
						deltaX: o.deltaX // Keep the X offset from dragging
					};
					setDisplacedObjects(prev => [...prev, displacedDef]);
					return null; // Remove from falling array
				}
				return { ...o, y, vy };
			}).filter(Boolean); // Remove nulls
			
			setFallingToShelf(nextShelf);
			fallingToShelfRef.current = nextShelf;
			
			if (anyFalling) {
				animRef.current = requestAnimationFrame(tick);
			} else {
				animRef.current = null;
			}
		};
		animRef.current = requestAnimationFrame(tick);
	};

	useEffect(() => {
	return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
	}, []);

	// Functions
	const handleReset = () => {
		setCurrentVolume(200);
		setWaterTopPosition(-48.5);
		setWaterBodyPosition(29);
		setOnShelfIds(new Set(allObjectIds));
		setDisplacedObjects([]);
		setObjectsInBeaker([]);
		setFallingToShelf([]);
		if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
	}

	const handleDragEnd = (event) => {
		const { over, delta, active } = event;
		const def = objectCatalog[active?.id];
		if (!def) return;
		
		// Check if this is a displaced object being dragged
		const displacedObj = displacedObjects.find(obj => obj.id === active.id);
		const isDisplacedObject = !!displacedObj;
		
		// If dropped directly over beaker droppable, start fall but do not displace yet
		if (over?.id === 'beaker') {
			if (isDisplacedObject) {
				setDisplacedObjects(prev => prev.filter(obj => obj.id !== active.id));
			} else {
				setOnShelfIds(prev => { const next = new Set(prev); next.delete(active.id); return next; });
			}
			// Center X by default
			const bw = (beakerRef.current?.clientWidth || 108);
			const x = (bw - def.size) / 2;
			setObjectsInBeaker(prev => [...prev, { id: active.id, x, y: -def.size, size: def.size, volume: def.volume, vy: 0, displaced: false, state: 'falling' }]);
			startAnimation();
			return;
		}

		// Check if it was dropped above the beaker horizontally
		if (beakerRef.current && active?.rect?.current?.initial) {
			const beakerRect = beakerRef.current.getBoundingClientRect();
			const init = active.rect.current.initial;
			const centerX = init.left + (init.width / 2) + (delta?.x || 0);
			const centerY = init.top + (init.height / 2) + (delta?.y || 0);
			const isHorizontallyOverBeaker = centerX >= beakerRect.left && centerX <= beakerRect.right;
			const isAboveBeaker = centerY < beakerRect.top;
			if (isHorizontallyOverBeaker && isAboveBeaker) {
				if (isDisplacedObject) {
					setDisplacedObjects(prev => prev.filter(obj => obj.id !== active.id));
				} else {
					setOnShelfIds(prev => { const next = new Set(prev); next.delete(active.id); return next; });
				}
				// Compute local X inside beaker coordinates and clamp
				const bw = (beakerRef.current.clientWidth || 108);
				const localX = Math.max(0, Math.min((centerX - beakerRect.left) - (def.size / 2), bw - def.size));
				setObjectsInBeaker(prev => [...prev, { id: active.id, x: localX, y: -def.size, size: def.size, volume: def.volume, vy: 0, displaced: false, state: 'falling' }]);
				startAnimation();
				return;
			}
		}
		
		// If not dropped over beaker and object was moved significantly, make it fall to Y=220
		if (delta && (Math.abs(delta.x) > 5 || Math.abs(delta.y) > 5)) {
			const targetY = 233; // Fixed target Y position for all objects (lowered from 190)
			
			if (isDisplacedObject) {
				setDisplacedObjects(prev => prev.filter(obj => obj.id !== active.id));
				// Use displaced object's position as starting point
				const startX = displacedObj.startX;
				const startY = displacedObj.startY;
				const droppedY = startY + (delta?.y || 0);
				
				setFallingToShelf(prev => [...prev, { 
					id: active.id, 
					leftValue: startX,
					deltaX: (displacedObj.deltaX || 0) + (delta?.x || 0),  // Combine existing offset with new drag
					y: droppedY,
					targetY: targetY, // Fall to Y=220
					vy: 0, 
					state: 'falling' 
				}]);
			} else {
				setOnShelfIds(prev => { const next = new Set(prev); next.delete(active.id); return next; });
				// Calculate the dropped position in the same coordinate system as the original objects
				const leftValue = typeof def.startX === 'string' ? def.startX : (def.startXPercent != null ? `${def.startXPercent}%` : (def.startX || 0));
				const droppedY = def.startY + (delta?.y || 0);
				
				setFallingToShelf(prev => [...prev, { 
					id: active.id, 
					leftValue: leftValue, // Keep original X positioning (percentage-based)
					deltaX: delta?.x || 0,  // Add the X offset from dragging
					y: droppedY,  // Start falling from where it was dropped
					targetY: targetY, // Fall to Y=220 instead of original position
					vy: 0, 
					state: 'falling' 
				}]);
			}
			startAnimation();
		}
	};

	return (
		<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
			<Container text="Water Displacement" showResetButton={true} onReset={handleReset}>

			{/* Rounded Beaker Container */}
				<div className="absolute top-[8%] left-[50%] translate-x-[-50%] w-[126.5px] h-[200px]">
					
					{/* Invisible Drop Zone - covers entire beaker opening area */}
					<div 
						ref={(node) => { setBeakerNodeRef(node); }} 
						className="absolute top-[-7.5%] left-[5%] w-[120px] h-[140px] z-[50]"
					>
					</div>
					
					{/* Top of Beaker */}
					<div className="absolute top-[-7.5%] left-[5%] w-[120px] h-[120px] scale-x-[1] scale-y-[0.2] border-4 border-gray-500 rounded-full">
					</div>
					{/* Left Side of Beaker */}
					<div className="absolute top-[22%] left-[5%] w-[0px] h-[138px] border-2 border-gray-500 rounded-full">
					</div>
					{/* Right Side of Beaker */}
					<div className="absolute top-[22%] right-[0%] w-[0px] h-[138px] border-2 border-gray-500 rounded-full">
					</div>
					{/* Beaker Lines */}
					<div className="absolute bottom-[16%] right-[0%] h-[100px] z-[4] flex flex-col justify-between">
						<svg className="w-[10px] h-[4px] transform rotate-[-25deg] origin-left rounded-full" viewBox="0 0 10 4">
							<path d="M 0 2 Q 6 3.5 10 2" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
						</svg>
						<svg className="w-[10px] h-[4px] transform rotate-[-25deg] origin-left rounded-full" viewBox="0 0 10 4">
							<path d="M 0 2 Q 6 3.5 10 2" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
						</svg>
						<svg className="w-[10px] h-[4px] transform rotate-[-25deg] origin-left rounded-full" viewBox="0 0 10 4">
							<path d="M 0 2 Q 6 3.5 10 2" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
						</svg>
						<svg className="w-[10px] h-[4px] transform rotate-[-25deg] origin-left rounded-full" viewBox="0 0 10 4">
							<path d="M 0 2 Q 6 3.5 10 2" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
						</svg>
						<svg className="w-[10px] h-[4px] transform rotate-[-25deg] origin-left rounded-full" viewBox="0 0 10 4">
							<path d="M 0 2 Q 6 3.5 10 2" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
						</svg>
					</div>
					{/* Bottom of Beaker */}
						{/* Invisible Part of Bottom of Beaker */}
						<div className="absolute top-[48.5%] left-[8.3%] w-[112px] h-[156px] scale-x-[1] scale-y-[0.2] bg-brown-900 rounded-full z-[1]">
						</div>
						{/* Visible Part of Bottom of Beaker */}
						<div className="absolute top-[60%] left-[5%] w-[120px] h-[120px] scale-x-[1] scale-y-[0.2] border-4 border-gray-500 rounded-full">
						</div>
					{/* Water */}
					<div ref={(node) => { beakerRef.current = node; }} className="absolute top-[17%] left-[9.5%] z-[2] h-[156px] w-[108px] flex flex-col items-end">
						{/* Top of Water */}
						<div className="absolute left-[0.5%] w-[108px] h-[112px] relative" style={{ bottom: waterTopPosition }}>
							<div className="absolute top-0 left-0 w-[108px] h-[112px] scale-x-[1] scale-y-[0.2] bg-blue-500 rounded-full z-[40] opacity-50"></div>
							<div className="absolute top-[23px] left-0 w-[108px] h-[55px] scale-x-[1] scale-y-[0.2] bg-blue-400 rounded-t-full z-[30] opacity-50"></div>
						</div>
						{/* Body of Water */}
						<div className="absolute bottom-[14.5%] left-[0.6%] w-[108px] bg-blue-400 z-[3] opacity-50" style={{ height: waterBodyPosition }}>
						</div>
						{/* Bottom of Water */}
						<div className="absolute bottom-[-28%] left-[0.6%] w-[108px] h-[110px] scale-x-[1] scale-y-[0.2] bg-blue-400 rounded-b-full z-[3] opacity-50">
						</div>
						{/* All objects inside beaker */}
						{objectsInBeaker.map(o => {
							// Calculate if object is submerged (below water surface)
							const beakerHeight = beakerRef.current?.clientHeight || 156;
							const bottomOffsetPx = beakerHeight * 0.145; // bottom-[14.5%]
							const waterSurfaceY = beakerHeight - bottomOffsetPx - (waterBodyPosition || 0);
							const isSubmerged = o.y >= waterSurfaceY;
							
							return (
								<div key={o.id} className="absolute z-[5]" style={{ top: o.y, left: o.x }}>
									<RenderObjectAppearance 
										type={objectCatalog[o.id]?.type} 
										size={o.size} 
										color={objectCatalog[o.id]?.color}
										isSubmerged={isSubmerged}
									/>
								</div>
							);
						})}
					</div>
					{/* Volume Indicator */}
                        <div className="absolute left-[50%] translate-x-[-50%] bottom-[-10%] w-[200px] text-center bg-white rounded-t-lg">
                            Starting Volume: 200mL
                        </div>
                        <div className="absolute left-[50%] translate-x-[-50%] bottom-[-21%] w-[200px] text-center bg-white rounded-b-lg">
                            Current Volume: {currentVolume}mL
                        </div>
				</div>

				{/* Objects (individually placed) */}
				<div className='absolute top-[25%] right-[0%] w-[50%] h-[140px] relative z-[3]'>
					{/* Original position objects */}
					{allObjectIds.filter(id => onShelfIds.has(id)).map(id => (
						<DraggableItem key={id} id={id} def={objectCatalog[id]} />
					))}
					
					{/* Displaced objects in their new positions */}
					{displacedObjects.map(def => (
						<DraggableItem key={`displaced-${def.id}`} id={def.id} def={def} />
					))}
					
					{/* Objects falling back to shelf */}
					{fallingToShelf.map(obj => (
						<div 
							key={`falling-${obj.id}`}
							className="absolute z-[5] pointer-events-none"
							style={{ 
								left: obj.leftValue,
								top: obj.y,
								transform: `translateX(${obj.deltaX}px)`
							}}
						>
							<RenderObjectAppearance 
								type={objectCatalog[obj.id]?.type} 
								size={objectCatalog[obj.id]?.size} 
								color={objectCatalog[obj.id]?.color} 
							/>
						</div>
					))}
			</div>

			{/* Flexi Prompt */}
			<FlexiText text="Water Displacement">
				Drop objects into the tank to see how the water level changes!
			</FlexiText>
		</Container>
		</DndContext>
	)
};


export default WaterDisplacementV2;