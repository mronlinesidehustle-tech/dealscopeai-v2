import React from 'react';

const HouseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);


export const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 mt-auto">
            <div className="container mx-auto px-4 md:px-8 py-6 text-slate-600 dark:text-slate-400 text-xs">
                <div className="flex items-center font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">
                    <HouseIcon className="w-5 h-5 mr-2" />
                    <span>LIKE FATHER LIKE SON INVESTMENTS</span>
                </div>
                <p className="mb-3">
                    Trevor Finn | 410-725-8737 | letsjv.realestate@gmail.com | trevor.finn@exprealty.com
                </p>
                <p className="text-slate-500 dark:text-slate-500">
                    This report is provided for informational purposes only and is intended solely as a rough estimate for real estate investors. It is not a contractor bid, quote, or guarantee of costs. Actual repair expenses may vary. By using this report, you agree that Like Father Like Son Investments assumes no liability for investment decisions or outcomes.
                </p>
            </div>
        </footer>
    );
};
