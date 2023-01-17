import React from 'react';

export default function MainSection({className, children, error, message}){

    return (
        <>
            <section className={`main${className ? ' '+className : ''}${message ? ' show-message' : ''}`}>
                {message && (
                    <div className={`message${message ? ' show' : ''}${error ? ' error' : ''}`}>
                        {message}
                    </div>
                )}
                {children}
            </section>

            <style jsx>{`@import '../styles/MainSection';`}</style>
        </>
    );
}