import React, { useState } from 'react';

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

const WaterDisplacementV2 = () => {
	return (
        <Container>
            <FlexiText text="Water Displacement">
                Drag and drop objects into the tank to see how the water level changes!
            </FlexiText>

            {/* Beaker */}
            <div className="absolute top-14 left-6 w-[100%] h-[200px]">
                {/* Top of Beaker */}
                <div className="absolute top-[-8%] left-[5%] w-[120px] h-[120px] scale-x-[1] scale-y-[0.2] border-4 border-red-500 rounded-full">
                </div>

                {/* Left Side of Beaker */}
                <div className="absolute top-[22%] left-[5%] w-[0px] h-[138px] border-2 border-red-500 rounded-full">
                </div>

                {/* Right Side of Beaker */}
                <div className="absolute top-[22%] left-[36.2%] w-[0px] h-[138px] border-2 border-red-500 rounded-full">
                </div>

                {/* Bottom of Beaker */}
                <svg className="absolute top-[60%] left-[5%] w-full h-full">
                    <path d="M 0 60 Q 60 80 120 60" stroke="red" strokeWidth="3" fill="none" />
                </svg>
            </div>
        </Container>
        )
};


export default WaterDisplacementV2;