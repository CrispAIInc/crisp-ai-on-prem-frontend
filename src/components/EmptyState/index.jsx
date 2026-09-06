import React from 'react';

function EmptyState({
    twClasses,
    icon: Icon,
    title,
    description
}) {

    return (
        <div className={`flex flex-col items-center justify-center text-center gap-2.5 py-6 px-4 ${twClasses}`}>
            <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                {Icon}
            </div>
            <strong className="text-ink text-[13px] font-semibold">{title}</strong>
            <span className="text-[12.5px] text-ink-muted max-w-[320px]">{description}</span>
        </div>
    );
}

export default EmptyState;