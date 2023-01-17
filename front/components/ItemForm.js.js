export default function ItemForm({title, children, className, headerClass, formClass, onSubmit, ...props}){
    return (
        <>
            <div className={`item-form${className ? ' '+className : ''}`}>
                <header className={`item-form-header${headerClass ? ' '+headerClass : ''}`}>
                    <h2>{title}</h2>
                </header>
                <section className="item-form-section">
                    <form
                        className={`item-form-section-form${formClass ? ' '+formClass : ''}`}
                        onSubmit={onSubmit ? onSubmit : e => e.preventDefault()}
                    >
                        {children}
                    </form>
                </section>
            </div>

            {/* <style jsx>{`@import '../styles/ItemForm';`}</style> */}
        </>
    );
}