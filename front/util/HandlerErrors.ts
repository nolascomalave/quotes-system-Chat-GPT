class HandlerErrors {
    protected errors: any = {};

    constructor(name?: string, error?: any) {
        if(name && error){
            this.set(name, error);
        }else if(name){
            throw 'If you define "name" parameter, you need to define "name" parameter!';
        }else if(error){
            throw 'If you define "error" parameter, you need to define "name" parameter!';
        }
    }

    public set(name:string, error: any): void {
        if(!error && (name in this.errors)){
            delete this.errors[name];
        }else if(!!error){
            this.errors[name]=error;
        }
    }

    public get(error: string): null | any {
        return this.errors[error] ?? null;
    }

    public getErrors(): null | object {
        if(Object.keys(this.errors).length > 0) return this.errors;
        return null;
    }

    public getArrayErrors(): any[] {
        let arrayErrors: any[] = [];

        for(let name in this.errors){
            arrayErrors.push(this.errors[name]);
        }

        return arrayErrors;
    }

    public existsErrors(): boolean {
        return (Object.keys(this.errors).length > 0);
    }

    public existsSome(...errors:string[]): boolean {
        return errors.some(err => !!this.errors[err]);
    }

    public exists(error: string): boolean {
        return !!this.errors[error];
    }

    public merege(errors: HandlerErrors | object): void{
        let newErrors = (!('existsErrors' in errors)) ? errors : errors.getErrors();

        if(!newErrors) return;

        this.errors = { ...this.errors, ...newErrors };
    }

    public pushErrorInArray(name: string, error: any, includeNulls?: boolean): void {
        if(!includeNulls && (error === undefined || error === null)) return;

        if(!this.exists(name)) this.errors[name] = [];
        this.errors[name].push(error ?? null);
    }

    public deleteError(...names: string[]): void {
        names.forEach(name => {
            if(name in this.errors) delete this.errors[name];
        });
    }

    public reset(): void {
        this.errors={};
    }
}

export default HandlerErrors;