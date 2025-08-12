import React from 'react';

export function Container({ 
	children, 
	className = "", 
	maxWidth = "max-w-[424px]",
	showBorder = true,
	selectNone = true,
	text = "Default Text",
	showResetButton = false,
	disableResetButton = false,
	onReset,
	...props 
}) {
	const baseClasses = [
		"w-full",
		"min-w-[300px]",
		"min-h-[500px]",
		"h-[500px]",
		maxWidth,
		"mx-auto",
		"px-2",
		"bg-white",
		"rounded-lg",
		"flex",
		"flex-col",
	];

	if (showBorder) {
		baseClasses.push("border border-gray-200");
	}

	if (selectNone) {
		baseClasses.push("select-none");
	}

	const containerClasses = `${baseClasses.join(" ")} ${className}`.trim();

	return (
		<div className={containerClasses} {...props}>
			<div className="p-4 w-[100%] h-[100%]">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-[#5750E3] text-sm font-medium select-none">{text}</h2>
					{showResetButton && (
						<button 
							className={`text-sm px-3 py-1 rounded border transition-colors ${
								disableResetButton 
									? 'text-gray-300 border-gray-200' 
									: 'text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400'
							}`}
							onClick={onReset}
							disabled={disableResetButton}
							title="Reset interactive"
						>
							Reset
						</button>
					)}
				</div>
				<div>
					<div className="w-full bg-white border border-[#5750E3]/30 rounded-md relative overflow-hidden" style={{ minHeight: '420px', height: '100%', width: '100%' }}>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
