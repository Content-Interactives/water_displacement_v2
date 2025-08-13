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

import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

function RenderObjectAppearance({ type, size, color }) {
	if (type === 'apple') {
		return (
			<div className="rounded-full relative" style={{ width: size, height: size, backgroundColor: color }}>
				<div className="absolute" style={{ top: '-5%', left: '60%', width: 12, height: 10, backgroundColor: '#22c55e', borderRadius: '9999px', transform: 'rotate(5deg)' }}></div>
				<div className="absolute" style={{ top: '15%', left: '20%', width: 15, height: 15, backgroundColor: '#fca5a5', borderRadius: '9999px', opacity: 0.6 }}></div>
			</div>
		);
	}
	if (type === 'ball') {
		return (
			<div className="rounded-full" style={{ width: size, height: size, background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${color} 60%)`, opacity: 1 }}></div>
		);
	}
	if (type === 'square') {
		return (
			<div className="" style={{ width: size, height: size, backgroundColor: color, borderRadius: 6 }}></div>
		);
	}
	if (type === 'rock') {
		return (
			<div className="" style={{ width: size, height: size * 0.7, backgroundColor: color, borderRadius: '40% 50% 35% 55% / 50% 40% 60% 45%' }}></div>
		);
	}
	return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 8 }}></div>;
}

function DraggableItem({ id, def }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
	const leftValue = typeof def.startX === 'string'
		? def.startX
		: (def.startXPercent != null ? `${def.startXPercent}%` : (def.startX || 0));
	const base = { position: 'absolute', left: leftValue, top: def.startY || 0 };
	const style = transform ? { ...base, transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : base;
	return (
		<div ref={setNodeRef} {...listeners} {...attributes} style={style} className="cursor-grab active:cursor-grabbing">
			<RenderObjectAppearance type={def.type} size={def.size} color={def.color} />
		</div>
	);
}

const WaterDisplacementV2 = () => {
	// Simple object catalog (extendable)
	const objectCatalog = {
		'apple-1': { type: 'apple', volume: 20, size: 50, color: '#ef4444', startX: '130%', startY: 130 },
		'ball-1': { type: 'ball', volume: 15, size: 40, color: '#f59e0b', startX: '105%', startY: 150 },
		'cube-1': { type: 'square', volume: 18, size: 45, color: '#3b82f6', startX: '155%', startY: 145 },
		'rock-1': { type: 'rock', volume: 15, size: 55, color: '#6b7280', startX: '120%', startY: 160 },
		'ball-2': { type: 'ball', volume: 8, size: 28, color: '#22d3ee', startX: '150%', startY: 170 }
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
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
	const { setNodeRef: setBeakerNodeRef } = useDroppable({ id: 'beaker' });
	const beakerRef = useRef(null);
	const [onShelfIds, setOnShelfIds] = useState(new Set(allObjectIds));
	// Objects currently inside the beaker (falling or resting)
	const [objectsInBeaker, setObjectsInBeaker] = useState([]);
	const objectsRef = useRef(objectsInBeaker);
	useEffect(() => { objectsRef.current = objectsInBeaker; }, [objectsInBeaker]);
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
			const curr = objectsRef.current;
			const next = curr.map(o => {
				if (o.state !== 'falling') return o;
				anyFalling = true;
				let vy = o.vy + gravity;
				let y = o.y + vy;
				// Displace water when entering
				if (!o.displaced && (y + o.size) >= waterSurfaceY) {
					setCurrentVolume(prev => prev + o.volume);
					setWaterTopPosition(prev => prev + o.volume - 5);
					setWaterBodyPosition(prev => Math.max(0, prev + o.volume - 5));
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
		setObjectsInBeaker([]);
		if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
	}

	const handleDragEnd = (event) => {
		const { over, delta, active } = event;
		const def = objectCatalog[active?.id];
		if (!def) return;
		// If dropped directly over beaker droppable, start fall but do not displace yet
		if (over?.id === 'beaker') {
			setOnShelfIds(prev => { const next = new Set(prev); next.delete(active.id); return next; });
			// Center X by default
			const bw = (beakerRef.current?.clientWidth || 108);
			const x = (bw - def.size) / 2;
			setObjectsInBeaker(prev => [...prev, { id: active.id, x, y: -def.size, size: def.size, volume: def.volume, vy: 0, displaced: false, state: 'falling' }]);
			startAnimation();
			return;
		}

		// Otherwise, check if it was dropped above the beaker horizontally
		if (!beakerRef.current || !active?.rect?.current?.initial) return;
		const beakerRect = beakerRef.current.getBoundingClientRect();
		const init = active.rect.current.initial;
		const centerX = init.left + (init.width / 2) + (delta?.x || 0);
		const centerY = init.top + (init.height / 2) + (delta?.y || 0);
		const isHorizontallyOverBeaker = centerX >= beakerRect.left && centerX <= beakerRect.right;
		const isAboveBeaker = centerY < beakerRect.top;
		if (isHorizontallyOverBeaker && isAboveBeaker) {
			setOnShelfIds(prev => { const next = new Set(prev); next.delete(active.id); return next; });
			// Compute local X inside beaker coordinates and clamp
			const bw = (beakerRef.current.clientWidth || 108);
			const localX = Math.max(0, Math.min((centerX - beakerRect.left) - (def.size / 2), bw - def.size));
			setObjectsInBeaker(prev => [...prev, { id: active.id, x: localX, y: -def.size, size: def.size, volume: def.volume, vy: 0, displaced: false, state: 'falling' }]);
			startAnimation();
		}
	};

	return (
		<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
			<Container text="Water Displacement" showResetButton={true} onReset={handleReset}>

				{/* Rounded Beaker Container */}
				<div className="absolute top-[8%] left-6 w-[126.5px] h-[200px]">
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
					<div ref={(node) => { setBeakerNodeRef(node); beakerRef.current = node; }} className="absolute top-[17%] left-[9.5%] z-[2] h-[156px] w-[108px] flex flex-col items-end">
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
						{objectsInBeaker.map(o => (
							<div key={o.id} className="absolute z-[5]" style={{ top: o.y, left: o.x }}>
								<RenderObjectAppearance type={objectCatalog[o.id]?.type} size={o.size} color={objectCatalog[o.id]?.color} />
							</div>
						))}
					</div>
					{/* Volume Indicator */}
                        <div className="absolute left-[-15%] bottom-[-10%] w-[200px] text-center bg-white rounded-t-lg">
                            Starting Volume: 200mL
                        </div>
                        <div className="absolute left-[-15%] bottom-[-21%] w-[200px] text-center bg-white rounded-b-lg">
                            Current Volume: {currentVolume}mL
                        </div>
				</div>

				{/* Objects (individually placed) */}
				<div className='absolute top-[25%] right-[0%] w-[50%] h-[140px] relative z-[3]'>
					{allObjectIds.filter(id => onShelfIds.has(id)).map(id => (
						<DraggableItem key={id} id={id} def={objectCatalog[id]} />
					))}
				</div>

                {/* Objects Tray */}
                <div className='absolute top-[20%] right-[1%] scale-x-[1] scale-y-[0.2] w-[200px] h-[200px] bg-gray-300 rounded-full z-[1]'>
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