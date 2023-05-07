export class Mesa {
    constructor(
        readonly eleccion:string,
        readonly candidatura:string,
        readonly departamento:string,
        readonly distrito:string,
        readonly zona:string,
        readonly local:string,
        readonly mesa:string,
        readonly codigo:string
    ) {}

    toObj(){
        return {
            eleccion:this.eleccion,
            candidatura:this.candidatura,
            departamento:this.departamento,
            distrito:this.distrito,
            zona:this.zona,
            local:this.local,
            mesa:this.mesa,
            codigo:this.codigo
        }
    }

    static fromObj(obj:Mesa): Mesa {
        return new Mesa(
            obj.eleccion,
            obj.candidatura,
            obj.departamento,
            obj.distrito,
            obj.zona,
            obj.local,
            obj.mesa,
            obj.codigo
        )
    }

    toString(){
            return '' + 'eleccion:'+ this.eleccion + ',' +
            'candidatura:'+ this.candidatura + ',' +
            'departamento:'+ this.departamento + ',' +
            'distrito:'+ this.distrito + ',' +
            'zona:'+ this.zona + ',' +
            'local:'+ this.local + ',' +
            'mesa:'+ this.mesa + ',' +
            'codigo:'+ this.codigo;
    }

    
}