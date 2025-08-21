import React, { useState, useCallback, useRef } from 'react';
import type { UploadedFile, MockupLevel } from '../types';
import { FINISH_LEVELS } from '../constants';

interface Step1InputFormProps {
    onAnalyze: (address: string, files: UploadedFile[], finishLevel: MockupLevel, purchasePrice: string) => void;
    isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });

const PhotoUploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export const Step1InputForm: React.FC<Step1InputFormProps> = ({ onAnalyze, isLoading }) => {
    const [address, setAddress] = useState<string>('');
    const [purchasePrice, setPurchasePrice] = useState<string>('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [finishLevel, setFinishLevel] = useState<MockupLevel>('Intermediate');
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles: UploadedFile[] = await Promise.all(
            Array.from(selectedFiles).map(async (file) => ({
                id: `${file.name}-${file.lastModified}`,
                name: file.name,
                type: file.type,
                base64: await fileToBase64(file),
                url: URL.createObjectURL(file),
            }))
        );
        
        setFiles(prev => [...prev, ...newFiles]);
    }, []);
    
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileChange(e.dataTransfer.files);
    };
    
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnalyze(address, files, finishLevel, purchasePrice);
    };

    const isInputReady = address.trim() !== '' && purchasePrice.trim() !== '' && files.length > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Get a Rehab Estimate</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Enter property details to get a cost breakdown.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Property Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g., 123 Main St, Anytown, USA"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="purchase-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Purchase Price
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400">$</span>
                        <input
                            type="number"
                            id="purchase-price"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            placeholder="e.g., 375000"
                            className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                            step="1000"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Property Photos
                    </label>
                    <label
                        htmlFor="photo-upload"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragOver ? 'border-sky-500' : 'border-slate-300 dark:border-slate-600'} border-dashed rounded-md cursor-pointer transition-colors duration-200`}
                    >
                         <div className="space-y-1 text-center">
                            <PhotoUploadIcon />
                            <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                <span className="relative font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
                                    Upload files
                                </span>
                                <input id="photo-upload" ref={fileInputRef} name="photo-upload" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {files.map(file => (
                            <div key={file.id} className="relative group">
                                <img src={file.url} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.id)}
                                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div>
                     <label htmlFor="finish-level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Target Finish Level
                    </label>
                    <select
                        id="finish-level"
                        value={finishLevel}
                        onChange={(e) => setFinishLevel(e.target.value as MockupLevel)}
                        disabled={!isInputReady}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                    >
                        {FINISH_LEVELS.map(level => (
                             <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !isInputReady}
                    className="w-full bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-colors duration-300"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Property'}
                </button>
            </form>
        </div>
    );
};
