"use client";

import React from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepTitles: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepTitles }: StepIndicatorProps) {
    return (
        <div className="flex items-center w-full mb-8">
            {Array.from({ length: totalSteps }, (_, i) => {
                const step = i + 1;
                const isCompleted = step < currentStep;
                const isActive = step === currentStep;

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                                ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                                ${!isActive && !isCompleted ? 'border-default-300 bg-transparent' : ''}
                            `}>
                                {isCompleted ? <FontAwesomeIcon icon={faCheck} /> : step}
                            </div>
                            <p className={`mt-2 text-xs text-center transition-colors duration-300 w-20
                                ${isActive ? 'text-primary font-semibold' : 'text-default-500'}
                                ${isCompleted ? 'text-primary' : ''}
                            `}>
                                {stepTitles[i] || `Step ${step}`}
                            </p>
                        </div>
                        {step < totalSteps && (
                            <div className={`flex-1 h-0.5 transition-colors duration-300
                                ${isCompleted ? 'bg-primary' : 'bg-default-300'}
                            `}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}