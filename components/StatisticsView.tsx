
import React, { useState } from 'react';
import { COLORS } from '../constants';
import { ScreenHeader } from './UIComponents';

export const StatisticsHub: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6 pb-32">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Driving Accuracy</h3>
                <div className="flex gap-4 items-end h-40">
                    <div className="flex-1 bg-blue-50 rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg" style={{ height: '65%' }}></div>
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold">65%</span>
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-t-lg relative group">
                        <div className="absolute bottom-0 w-full bg-green-500 rounded-t-lg" style={{ height: '72%' }}></div>
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold">72%</span>
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>You</span>
                    <span>Tour Avg</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Greens in Regulation</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-black text-gray-900">52%</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Season Avg</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-black text-green-600">68%</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Best Round</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
