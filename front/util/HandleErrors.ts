class HandleErrors {
    protected errors: object = {};

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

    public deleteError(...names: string[]): void {
        names.forEach(name => {
            if(name in this.errors) delete this.errors[name];
        });
    }

    public reset(): void {
        this.errors={};
    }
}

export default HandleErrors;