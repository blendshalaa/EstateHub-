import React, { Fragment } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Modal = ({ isOpen, onClose, title, children, className }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Panel */}
                <div className={cn(
                    "relative transform overflow-hidden rounded-lg bg-primary-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-primary-800",
                    className
                )}>
                    <div className="bg-primary-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="absolute right-0 top-0 pr-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md bg-primary-900 text-primary-400 hover:text-white focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-2">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
