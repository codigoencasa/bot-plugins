class ClassManager {
    private static instance: ClassManager;
    private instances: Map<string, any>;

    private constructor() {
        this.instances = new Map<string, any>();
    }

    public static hub(): ClassManager {
        if (!ClassManager.instance) {
            ClassManager.instance = new ClassManager();
        }
        return ClassManager.instance;
    }

    /**
     * ClassManager.hub().add('name', classeInstance)
     * @param name 
     * @param instance 
     */
    public add(name: string, instance: any): void {
        this.instances.set(name, instance);
    }

    /**
     * Recupera el instanciamiento de una clase 
     * ClassManager.hub().get('name')
     * @param nombre 
     * @returns 
     */
    public get<T = any>(nombre: string): T {
        return this.instances.get(nombre);
    }
}
export { ClassManager }