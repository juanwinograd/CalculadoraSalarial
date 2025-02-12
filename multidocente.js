const MES_ACTUAL = "enero 2025";
const DescuentoOS = 0.06, DescuentoJubilacion = 0.13, DescuentoFCompensador = 0.003, DescuentoCajaComp = 0.045;
var Rem = 1 - (DescuentoOS + DescuentoJubilacion + DescuentoFCompensador);
var DescuentoAdemys = 0, DescuentoPresentismo = 0;

// const AumentoAsignaciones = 1.2375*1.25625*1.5641*1.5*1.8666667*1.68;
// const ValorUMAF = 50*AumentoAsignaciones;
const TopesAsignaciones = [60000,87500,114500];
const MontosAsignaciones = { 
            matrimonio : [158,158,158,1000],
            nacimiento : [106,106,106,1000],
            nacimientoDiscapacidad : [133,133,133,3000],
            adopcion : [629,629,629,3600],
            adopcionDiscapacidad : [629,629,629,10800],
            embarazo : [61,37,19,270],
            conviviente : [22,22,22,100],
            hijo : [61,37,19,270],
            hijoDiscapacidad : [208,132,132,3000],
            anualEscolar : [76,76,76,300],
            anualEscolarDiscapacidad : [134,134,134,900],
            violencia : [366,366,336,0]
};

var mostrarDetalle = false, segundoCargo = false, mostrarAsignaciones = false;
var privada = false;
var asignaciones = {
            embarazo : 0,
            conviviente : 0,
            hijo : 0,
            hijoDiscapacidad : 0
};

//Calcula cuanto cobras de un item por hs horas cátedra
function item_horas(hs, maxHoras, tope) {
    var item;
    if (hs < maxHoras) { 
        item = tope/maxHoras*hs; 
    }
    else {
        item = tope;
    }
    return(item);
}

class Cargo {
    constructor(area, jornada, puntaje = 0, horas = 0, plus = 0, plusEscRecuperacion = 0, plusExclusiva = 0) {
        this.area = area;
        this.jornada = jornada;
        this.puntaje = puntaje;
        this.horas = horas;
        this.plus = plus;
        this.plusEscRecuperacion = plusEscRecuperacion;
        this.plusExclusiva = plusExclusiva;
    }

    clone() {
        return new Cargo(this.area, this.jornada, this.puntaje, this.horas, this.plus, this.plusEscRecuperacion, this.plusExclusiva);
    }
}

class Docente {
    constructor(mes, antiguedad = -1) {
        this.antiguedad = antiguedad;
        this.cargos = [new Cargo()];

        if (mes) this.fijar_valoresJC(mes, antiguedad);

        this.calculado = false;
    }

    fijar_valoresJC(mes,antiguedad) {
        this.mes = mes;
        this.valoresJC = valor_items[mes];
        if (antiguedad != -1) {  this.fijar_mdm(); }
    }

    clone(mes) {
        var docente = new Docente(mes,this.antiguedad);
        docente.antiguedad = this.antiguedad;
        docente.cargos = [];
        for (let cargo of this.cargos) {
            docente.cargos.push(cargo.clone());
        }
        docente.calcular_sueldo_docente();
        return docente;
    }

    //calcula el valor de cada item para el cargo
    calcular_items(cargo) {		
        
        //Valores JC
        let PuntoIndice = this.valoresJC.puntoIndice,
        Dec483 = this.valoresJC.dec483,
        Dec483Piso = this.valoresJC.dec483Piso,
        SumaFija = this.valoresJC.sumaFija,
        AdicionalEspecial = this.valoresJC.adicionalEspecial,
        FONID = this.valoresJC.fonid,
        Conectividad = this.valoresJC.conectividad,
        SalarioMinimo = this.valoresJC.salarioMinimo,
        SalarioMinimoPiso = this.valoresJC.salarioMinimoPiso,
        SalarioMinimoPisoJS = this.valoresJC.salarioMinimoPisoJS,
        MDM = this.valoresJC.mdm,
        MDMPiso = this.valoresJC.mdmPiso;

        var proporcion;
            
        if (cargo.jornada == "JS") {
            cargo.dec483 = Dec483/2; cargo.fonid = FONID/2; cargo.conectividad = Conectividad/2; cargo.adicionalEspecial = AdicionalEspecial/2; cargo.salarioMinimo = SalarioMinimo/2; cargo.mdm = MDM/2;
            cargo.sumaFija = SumaFija/2;

            proporcion = cargo.puntaje/1135;
            // si el puntaje es menor a 1135 hago proporcional a menos que quede por debajo del piso
            if (proporcion < 1) {
                if (cargo.dec483*proporcion > Dec483Piso/2) {cargo.dec483 = Dec483/2*proporcion;} else {cargo.dec483 = Dec483Piso/2;}
                if (cargo.salarioMinimo*proporcion > SalarioMinimoPisoJS) {cargo.salarioMinimo = SalarioMinimo/2*proporcion;} else {cargo.salarioMinimo = SalarioMinimoPisoJS}
                if (cargo.mdm*proporcion > MDMPiso/2) {cargo.mdm = MDM/2*proporcion;} else {cargo.mdm = MDMPiso/2;}
                cargo.sumaFija = cargo.sumaFija*proporcion;
            }
            if (cargo.horas > 0) {   	   			
                cargo.adicionalEspecial = item_horas(cargo.horas,30,AdicionalEspecial);
                cargo.fonid = item_horas(cargo.horas,30,FONID);
                cargo.conectividad = item_horas(cargo.horas,30,Conectividad);
            }
        }
        else if (cargo.jornada == "JC") {
            cargo.dec483 = Dec483; cargo.fonid = FONID; cargo.conectividad = Conectividad; cargo.adicionalEspecial = AdicionalEspecial; cargo.salarioMinimo = SalarioMinimo; cargo.mdm = MDM;
            cargo.sumaFija = SumaFija;

            proporcion = cargo.puntaje/2070;
            if (proporcion < 1) {
                if (cargo.dec483*proporcion > Dec483Piso) {cargo.dec483 = Dec483*proporcion;} else {cargo.dec483 = Dec483Piso;}
                if (cargo.salarioMinimo*proporcion > SalarioMinimoPiso) {cargo.salarioMinimo = SalarioMinimo*proporcion;} else {cargo.salarioMinimo = SalarioMinimoPiso;}
                if (cargo.mdm*proporcion > MDMPiso) {cargo.mdm = MDM*proporcion;} else {cargo.mdm = MDMPiso;}
                cargo.sumaFija = SumaFija*proporcion;
            }
        }
        // horas    	   	
        else if (cargo.jornada == "HorasM") {
            cargo.dec483 = item_horas(cargo.horas,38,Dec483);
            cargo.mdm = item_horas(cargo.horas,38,MDM);
            cargo.sumaFija = item_horas(cargo.horas,38,SumaFija);
            cargo.adicionalEspecial = item_horas(cargo.horas,30,AdicionalEspecial);
            cargo.fonid = item_horas(cargo.horas,30,FONID);
            cargo.conectividad = item_horas(cargo.horas,30,Conectividad);
            cargo.salarioMinimo = item_horas(cargo.horas,40,SalarioMinimo);
        }
        else if (cargo.jornada == "HorasT") {
            cargo.dec483 = item_horas(cargo.horas,38,Dec483);
            cargo.mdm = item_horas(cargo.horas,38,MDM);
            cargo.sumaFija = item_horas(cargo.horas,38,SumaFija);
            cargo.adicionalEspecial = item_horas(cargo.horas,24,AdicionalEspecial);
            cargo.fonid = item_horas(cargo.horas,24,FONID);
            cargo.conectividad = item_horas(cargo.horas,24,Conectividad);
            cargo.salarioMinimo = item_horas(cargo.horas,40,SalarioMinimo);
        }
        //basico
        cargo.basico =  cargo.puntaje*PuntoIndice;

        //si no corresponde los plus son 0	
        cargo.jerarquizacion = cargo.basico*cargo.plus;
        cargo.dedicacionExclusiva = cargo.plusExclusiva*PuntoIndice;
        cargo.supleEscRec = (cargo.basico+cargo.dec483)*cargo.plusEscRecuperacion;
        
        //Jerarquizacion y su proporcional del presentismo no cuentan para cmg
        // cargo.salarioMinimo = cargo.salarioMinimo + cargo.jerarquizacion*1.1*Rem;


        cargo.antiguedadBasico = (cargo.basico + cargo.jerarquizacion + cargo.dedicacionExclusiva)*this.antiguedad;
        cargo.antiguedadDec483 = cargo.dec483*this.antiguedad
    }

    //calcula el sueldo a partir de los items
    calcular_sueldo() {

        //sumo las cifras remunerativas
        this.sinCMG = (this.basico*1.1 + this.dec483*1.1 + this.antiguedadBasico + this.antiguedadDec483 + this.supleEscRec)*Rem;

        //segun antiguedad mdm es remunerativo o no
        if (this.antiguedad >= 0.5)
            this.sinCMG = this.sinCMG + this.mdm*Rem;
        else
            this.sinCMG = this.sinCMG + this.mdm
            
        //si quedo por debajo del minimo, la diferencia me da el cmg
        if (this.sinCMG < this.salarioMinimo) {this.cmg = this.salarioMinimo - this.sinCMG}
        else {this.cmg = 0;}

        //calculo adicional salarial por presentismo
        this.presentismo = (this.basico + this.dec483 + this.jerarquizacion + this.dedicacionExclusiva)*0.1;
        // descuento presentismo
        if (DescuentoPresentismo) {            
            this.descuentoPresentismo = -this.presentismo;
            this.presentismo = 0;
        }
        else
            this.descuentoPresentismo = 0;

        // sumo todo lo remunerativo
        this.remus = this.basico + this.dec483 + this.jerarquizacion + this.dedicacionExclusiva
                    + this.presentismo + this.antiguedadBasico + this.antiguedadDec483 + this.supleEscRec;
        if (this.antiguedad >= 0.5) this.remus = this.remus + this.mdm;

        // descuentos
        this.descuentoOS = -this.remus*DescuentoOS;
        this.descuentoJubilacion = -this.remus*DescuentoJubilacion;
        if (privada) { 
            this.descuentoCajaComp = -this.remus*DescuentoCajaComp; 
            this.descuentoFCompensador = 0;
        }
        else {
            this.descuentoFCompensador = -this.remus*DescuentoFCompensador;
            this.descuentoCajaComp = 0;
        }
        this.descuentoAdemys = -(this.remus + this.cmg)*DescuentoAdemys;
        this.descuentoTotal = this.descuentoOS + this.descuentoJubilacion 
                    + this.descuentoFCompensador + this.descuentoCajaComp + this.descuentoAdemys;	

        //para el bruto sumo todo
        this.sueldoBruto = this.remus + this.fonid + this.conectividad + this.adicionalEspecial + this.cmg + this.sumaFija;
        if (this.antiguedad < 0.5) this.sueldoBruto = this.sueldoBruto + this.mdm;

        //Primera Infancia
        if (this.adicionalExtendida > 0) {this.sueldoBruto = this.sueldoBruto + this.adicionalExtendida;}
                
        //para el neto resto los descuentos
        this.sueldoNeto = this.sueldoBruto + this.descuentoTotal;
    }

    //suma todos los cargos de un docente
    sumar_cargos() {
        for (let key in items) {
            //if (items[key].tipo == 'r' || items[key].tipo == 'nr') {
                let suma = 0;
                //sumo todos los cargos
                for (let cargo of this.cargos) {
                    suma += cargo[key];
                }
                //si supera el tope, pongo el tope
                if (items[key].tope && suma > this.valoresJC[key]) {
                    this[key] = this.valoresJC[key];
                }
                //si no, pongo la suma
                else {
                    this[key] = suma;
                }
            //}
        }
    }

    //calcula el sueldo de un docente con 1 o más cargos
    calcular_sueldo_docente() {
        for (let cargo of this.cargos) {
            this.calcular_items(cargo);
        }
        this.sumar_cargos();
        this.calcular_sueldo();        
        this.sumar_asignaciones();

        this.calculado = true;

        return this.sueldoNeto;
    }    

    //suma asigaciones segun ley octubre 2021
    sumar_asignaciones() {
        let franja;
        let sueldo = this.sueldoBruto;
        if (sueldo >= TopesAsignaciones[2]*this.valoresJC["valorUMAF"]) {
            for (let asignacion in asignaciones) { 
                this[asignacion] = MontosAsignaciones[asignacion][3]*asignaciones[asignacion]; 
                items[asignacion].descripcion = "Superaste el tope puesto por la nueva ley. Si venías cobrando de antes, tenés que seguir cobrando el mismo monto"
            }
        }
        else {
            if (sueldo >= TopesAsignaciones[1]*this.valoresJC["valorUMAF"])
                franja = 2;
            else if (sueldo >= TopesAsignaciones[0]*this.valoresJC["valorUMAF"])
                franja = 1;
            else
                franja = 0;
            for (let asignacion in asignaciones) {
                this[asignacion] = MontosAsignaciones[asignacion][franja]*asignaciones[asignacion]*this.valoresJC["valorUMAF"];
                // if (this.horas < 18) {this[asignacion] = this.asignacion*0.5;}
                this.sueldoBruto += this[asignacion];
                this.sueldoNeto += this[asignacion];
            }
        }
    }

    //muestra un detalle del sueldo
    detalle() {
        var detalle = [];
        for (let key in items) {
            if (key != "minimo" && this[key] != undefined && this[key] != 0) {
                let item = {
                    nombre: items[key].nombre,
                    monto: Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(this[key]),
                    tipo: items[key].tipo, 
                    descripcion: items[key].descripcion
                }
                if (this[key] == items[key].tope) {
                    item.max = true;
                }
                detalle.push(item);
            }
        }
        return(detalle);
    }

    fijar_mdm() {
        if (this.antiguedad <= 0.4)	{
            this.valoresJC.mdm = this.valoresJC.mdm0_60; this.valoresJC.mdmPiso = this.valoresJC.mdm0_60Piso;
            items.mdm.tipo = 'nr';
            //items.mdm.descripcion = "Hasta los 6 años antigüedad son $"+this.valoresJC.mdm/2+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs";
        }
        else {
            this.valoresJC.mdm = this.valoresJC.mdm70_120; this.valoresJC.mdmPiso = this.valoresJC.mdm70_120Piso;
            items.mdm.tipo = 'r';
            //items.mdm.descripcion = "Desde los 7 años antigüedad son $"+this.valoresJC.mdm/2+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs"
        }
    }
}

var docente = new Docente();

var valor_items, mes = "";
fetch('https://raw.githubusercontent.com/juanwinograd/CalculadoraAdemys/main/valoritems_minuscula.json')
    .then(response => response.json())
    .then(data => {
        valor_items = data;
        var select = document.createElement('select');
        select.setAttribute("class","tdForm");
        select.setAttribute("id","mes");
        const optionElement = document.createElement("option");  
        optionElement.textContent = 'Seleccionar mes'; 
        optionElement.value = ''; 
        select.appendChild(optionElement);
        for (let mes in valor_items) { 
            const optionElement = document.createElement("option"); 
            optionElement.value = mes; 
            optionElement.textContent = mes; 
            select.appendChild(optionElement); 
        };
        document.getElementById("contenedor-mes").appendChild(select);
        select.setAttribute("onchange","elegir_mes(event)");

        //fijo el mes en el que se carga la página
        docente.fijar_valoresJC(MES_ACTUAL);
    })
    .catch(error => console.error('Error loading JSON:', error));
    
var ipc;
fetch('https://raw.githubusercontent.com/juanwinograd/CalculadoraAdemys/main/ipc.json')
    .then(response => response.json())
    .then(data => {
        ipc = data;
    })
    .catch(error => console.error('Error loading JSON:', error));

var items = {
    basico : {
        nombre : "Sueldo Básico", 
        tope : false, 
        tipo : 'r', 
        //descripcion : "Sueldo básico de acuerdo al cargo"    
    },
    jerarquizacion : {
        nombre : "Plus Jerarquización",
        tope : false,
        tipo : 'r',
        //descripcion : "En general es el 15% del básico. Para directorxs hay un plus adicional que dependiendo de la cantidad de turnos y secciones puede ser 6,   10 o 15%, acá sumamos el 6%"
    },
    dedicacionExclusiva : {
        nombre : "Dedicación Exclusiva",
        tope : false,
        tipo : 'r',
        //descripcion : "Plus para rectorx de media de 40 horas semanales"
    },
    antiguedadBasico : {
        nombre : "Antigüedad",
        tope : false,
        tipo : 'r',
        //descripcion : "Antigüedad sobre el básico"
    },
    presentismo : {
        nombre : "Adicional Salarial",
        tope : false,
        tipo : 'r',
        //descripcion : "Presentismo: 10% del básico y del Decreto 483/05. Se paga con un mes de atraso."
    },
    dec483 : {
        nombre : "Suma Decreto 483/05",
        tope : true,
        tipo : 'r',
        //descripcion : "$"+(valoresJC.dec483/2)+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs"
    },
    antiguedadDec483 : {
        nombre : "Antigüedad Dec. 483",
        tope : true,
        tipo : 'r',
        //descripcion :  "Antigüedad sobre el Decreto 483/05"
    },
    mdm : {
        nombre : "Material Didáctico Mensual",
        tope : true,
        tipo : 'nr',
        //descripcion :  ""
    },
    salarioMinimo : {
        nombre : "Salario Mínimo",
        tope : true,
        tipo : 'minimo'
    },
    cmg : {
        nombre : "Complemento Mínimo Garantizado",
        tope : false,
        tipo : 'nr',
        //descripcion :  "Es la diferencia entre lo que sería tu sueldo por antigüedad y el salario mínimo docente"
    },
    adicionalEspecial : {
        nombre : "Compensación Fija Proporcional",
        tope : true,
        tipo : 'nr',
        //descripcion :  "$"+(valoresJC.adicionalEspecialecial/2)+" por cargo simple o 15hs. Se paga hasta dos cargos o 30hs"
    },
    fonid : {
        nombre : "Fo.Na.In.Do",
        tope : true,
        tipo : 'nr',
        //descripcion :  "$"+(valoresJC.fonid/2)+" por cargo simple o 15hs. Se paga hasta dos cargos o 30hs"
    },
    conectividad : {
        nombre : "Compensación Transitoria",
        tope : true,
        tipo : 'nr',
        //descripcion :  "(reemplazó al item Conectividad) $"+(valoresJC.conectividad/2)+" por cargo simple o 15hs. Se paga hasta dos cargos o 30hs"
    },
    sumaFija : {
        nombre : "Suma Fija",
        tope : true,
        tipo : 'nr',
        //descripcion :  "$"+(valoresJC.sumaFija/2)+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs"
    },
    adicionalExtendida : {
        nombre : "Adicional Turno Extendido",
        tope : true,
        tipo : 'nr',
        //descripcion :  "Adicional de $"+(valoresJC.adicionalExtendida)+" para el cargo de turno extendido de Primera Infancia"
    },
    supleEscRec : {
        nombre : "Suplemento Esc. Recupración",
        tope : false,
        tipo : 'r',
        //descripcion :  "15% sobre las sumas bonificables, para docentes de Especial."
        },
    sueldoBruto : {
        nombre : "Sueldo Bruto",
        tope : false,
        tipo : 's'
    },
    descuentoOS : {
        nombre : "Obra Social",
        tope : false,
        tipo : 'd',
        //descripcion :  "6% de las cifras remunerativa. Son dos items: 3% para la obra social y otro 3% para otorgar cobertura a jubilados."
    },
    descuentoJubilacion : {
        nombre : "Jubilación",
        tope : false,
        tipo : 'd',
        //descripcion :  "13% de las cifras remunerativas. 11% del régimen general más un 2% del régimen especial docente."
    },
    descuentoFCompensador : {
        nombre : "Fondo Compensador",
        tope : false,
        tipo : 'd',
        //descripcion :  "0,3% de las cifras remunerativas. Es un seguro de vida obligatorio."
    },
    descuentoCajaComp : {
        nombre : "Caja Complementaria",
        tope : false,
        tipo : 'd',
        //descripcion :  "4,5% de las cifras remunerativas. Es un aporte extra para acceder a un complemento a la jubilación. Se aplica por defecto a los docentes de privada."
    },
    descuentoAdemys : {
        nombre : "ADEMYS",
        tope : false,
        tipo : 'd',
        //descripcion :  "1,5% de las cifras remunerativas y del C.M.G."
    },
    descuentoPresentismo : {
        nombre : "Desc. Adicional Salarial",
        tope : false,
        tipo : 'd',
        //descripcion :  "Presentismo: 10% del básico y del Decreto 483/05. Se descuenta con un mes de atraso."
    },
    sueldoNeto : {
        nombre : "Sueldo Neto",
        tope : false,
        tipo : 's'
    },
    hijo : {
        nombre: 'Asignación Hijo/a',
        tope : false,
        tipo : 'a'
    },
    hijoDiscapacidad : {
        nombre: 'Asignación Hijo/a con discapacidad',
        tope : false,
        tipo : 'a'
    },
    embarazo : {
        nombre: 'Asignación por embarazo',
        tope : false,
        tipo : 'a'
    },
    conviviente : {
        nombre: 'Asignación por conyugüe o conviviente',
        tope : false,
        tipo : 'a'}
};

function elegir_area(evt) {	
    var id = evt.target.id;
    var n = id[id.length-1];
    //reseteo los valores
    docente.cargos[n].puntaje = 0; docente.cargos[n].horas = 0; docente.cargos[n].plus = 0; docente.cargos[n].plusEscRecuperacion = 0;
    docente.cargos[n].adicionalExtendida = 0; docente.cargos[n].plusExclusiva = 0;
    docente.calculado = false;
    var selectorArea = document.getElementById(id);
    docente.cargos[n].area = selectorArea.options[selectorArea.selectedIndex].value;
    if (docente.cargos[n].area == "horas") { 
        docente.cargos[n].jornada = "HorasM"; document.getElementById("horas"+n).value = "";
    }
    else if (docente.cargos[n].area == "jornada") {document.getElementById(docente.cargos[n].area+n).options[0].selected = true;} //bug Lubo
    //tomo todo lo que no es primaria como js  
    else {docente.cargos[n].jornada = "JS"; document.getElementById(docente.cargos[n].area+n).options[0].selected = true;}

    var ocultables = document.getElementsByClassName("oculto"+n);
    for (oc of ocultables) {
        oc.style.display = "none";
    }    

    document.getElementById(docente.cargos[n].area+n).style.display = "inline";
    calcular(n);
}
function elegir_jornada(evt) {	
    var id = evt.target.id;
    var n = id[id.length-1];
    var selectorJornada = document.getElementById(id);
    docente.calculado = false;
    docente.cargos[n].jornada = selectorJornada.options[selectorJornada.selectedIndex].value;
    for (opt of selectorJornada) {
        if (opt.index != selectorJornada.selectedIndex) {
            if (document.getElementById(opt.value+n) != null) {
                document.getElementById(opt.value+n).style.display = "none";
            }
        }
    }
    if (docente.cargos[n].jornada != "") {
        document.getElementById('bruto').innerHTML = "Seleccionar cargo"
        document.getElementById('neto').innerHTML = "Seleccionar cargo"          
            
        document.getElementById(docente.cargos[n].jornada+n).style.display = "inline";
        document.getElementById(docente.cargos[n].jornada+n).options[0].selected = true;	
    }
    if (mes) {mostrar_caida(mes);}
}
function elegir_supervisor(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];

    docente.cargos[n].jornada = "JC";

    var selectorCargo = document.getElementById(id);
    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    
    docente.cargos[n].plus = 0.3;

    calcular(n);
}
function elegir_cargo(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];

    var selectorCargo = document.getElementById(id);
    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    
    //si corresponde fijo el plus por jerarquzacion
    if (selectorCargo.selectedIndex == 1) { docente.cargos[n].plus = 0.21;}
    else if (selectorCargo.selectedIndex < 4) { docente.cargos[n].plus = 0.15;}
    else { docente.cargos[n].plus = 0;}	
    
    //Primera infancia
    if (docente.cargos[n].puntaje == 1368) { docente.cargos[n].adicionalExtendida = docente.valoresJC.adicionalExtendida}
    else {docente.cargos[n].adicionalExtendida = 0}

    calcular(n);
}
function elegir_especial(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];
    docente.cargos[n].horas = 0; document.getElementById("horas"+n).style.display = "none";

    var selectorCargo = document.getElementById(id);
    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    
    docente.cargos[n].plus = 0;
    docente.cargos[n].plusEscRecuperacion = 0.15;
    
    //director
    if (selectorCargo.selectedIndex == 1) { docente.cargos[n].plus = 0.21; docente.cargos[n].jornada = "JC";}
    //vice o secratario
    else if (selectorCargo.selectedIndex < 4) { docente.cargos[n].plus = 0.15; docente.cargos[n].jornada = "JC";}
    //acdm 40
    else if (selectorCargo.selectedIndex < 6) { docente.cargos[n].plus = 0; docente.cargos[n].jornada = "JC";}
    //ILSE
    else if (selectorCargo.selectedIndex >= selectorCargo.length-2) {				
        docente.cargos[n].jornada = "HorasM";
        docente.cargos[n].plus = 0;
        document.getElementById("horas"+n).style.display = "inline";
        document.getElementById("horas"+n).value = "";
        document.getElementById('bruto').innerHTML = "Ingresar cant. horas";
        document.getElementById('neto').innerHTML = "Ingresar cant. horas";		            
                }
    // todo lo demas
    else { docente.cargos[n].plus = 0; docente.cargos[n].jornada = "JS";}

    calcular(n);
}
function elegir_adultos(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];

    var selectorCargo = document.getElementById(id);
    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    
    //si corresponde fijo el plus por jerarquzacion
    if (selectorCargo.selectedIndex == 1) { docente.cargos[n].plus = 0.21;}
    else if (selectorCargo.selectedIndex == 2) { docente.cargos[n].plus = 0.15;}
    else { docente.cargos[n].plus = 0;}

    if (selectorCargo.selectedIndex == selectorCargo.length - 1) {docente.cargos[n].jornada = "HorasM";docente.cargos[n].horas = 10;}
    else {docente.cargos[n].jornada = "JS";docente.cargos[n].horas = 0;}

    calcular(n);
}
function elegir_media(evt) {	
    var id = evt.target.id;
    var n = id[id.length-1];
    docente.cargos[n].horas = 0; document.getElementById("horas"+n).style.display = "none";
    
    var selectorCargo = document.getElementById(id);

    if (selectorCargo.selectedIndex == 1) 
        docente.cargos[n].plusExclusiva = 1008;
    else
        docente.cargos[n].plusExclusiva = 0;
    
    //rector y vice
    if (selectorCargo.selectedIndex < 4) { 
        docente.cargos[n].jornada = "JC";
        if (selectorCargo.selectedIndex < 3) { docente.cargos[n].plus = 0.21; }
        else if (selectorCargo.selectedIndex == 3) { docente.cargos[n].plus = 0.15; }
        else {docente.cargos[n].plus = 0;}  
    }
    //regente, subregnte y jefe de taller
    else if (selectorCargo.selectedIndex < 7 ) {
        docente.cargos[n].plus = 0.15;
        docente.cargos[n].jornada = "JS";
    }
    //cargos estandar
    else if (selectorCargo.selectedIndex < 13) {
        docente.cargos[n].jornada = "JS";
        docente.cargos[n].plus = 0;
    }
    //asesor pedagogico
    else if (selectorCargo.selectedIndex == 13) {
        docente.cargos[n].jornada = "HorasM";
        docente.cargos[n].horas = 36;
        docente.cargos[n].plus = 0;
    }
    //jefe de labo, MEP, attp
    else if (selectorCargo.selectedIndex < 17) {
        docente.cargos[n].jornada = "JS";
        docente.cargos[n].horas = 24;
        docente.cargos[n].plus = 0;
    }
    //psico, aycp
    else if (selectorCargo.selectedIndex < 19) {
        docente.cargos[n].jornada = "JS";
        docente.cargos[n].horas = 18;
        docente.cargos[n].plus = 0;
    }
    //hora cátedra
    else {				
        docente.cargos[n].jornada = "HorasM";
        docente.cargos[n].plus = 0;
        document.getElementById("horas"+n).style.display = "inline";
        document.getElementById("horas"+n).value = "";
        document.getElementById('bruto').innerHTML = "Ingresar cant. horas";
        document.getElementById('neto').innerHTML = "Ingresar cant. horas";		            
                }

    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    calcular(n);
}
function elegir_cens(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];

    var selectorCargo = document.getElementById(id);
    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    
    //si corresponde fijo el plus por jerarquzacion
    if (selectorCargo.selectedIndex == 1) { docente.cargos[n].plus = 0.21;}
    else { docente.cargos[n].plus = 0;}

    calcular(n);
}
function elegir_terciaria(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];
    docente.cargos[n].horas = -1;  document.getElementById("horas"+n).style.display = "none";
    var selectorCargo = document.getElementById(id);
    
    // director, vice y regente los trato como jc
    if (selectorCargo.selectedIndex < 4 ) {
        docente.cargos[n].jornada = "JC";
        if (selectorCargo.selectedIndex == 1 ) {docente.cargos[n].plus = 0.30;	}
        else {docente.cargos[n].plus = 0.15;}
    }
    //horas catedra			
    else if (selectorCargo.selectedIndex == 9) {
        docente.cargos[n].plus = 0;
        docente.cargos[n].jornada = "HorasT"
        document.getElementById("horas"+n).style.display = "inline";
        document.getElementById("horas"+n).value = "";			
        document.getElementById('bruto').innerHTML = "Ingresar cant. horas";
        document.getElementById('neto').innerHTML = "Ingresar cant. horas";            
                }
    //cargos estandar
    else {
        docente.cargos[n].jornada = "JS";
        docente.cargos[n].plus = 0;
    }

    docente.cargos[n].puntaje = Number(selectorCargo.options[selectorCargo.selectedIndex].value);
    calcular(n);
}
function elegir_horas(evt) {
    var id = evt.target.id;
    var n = id[id.length-1];
    docente.cargos[n].horas = document.getElementById(id).value;
    if (docente.cargos[n].jornada == "HorasM") {docente.cargos[n].puntaje = 56*docente.cargos[n].horas;}
    else if (docente.cargos[n].jornada == "HorasT") {docente.cargos[n].puntaje = 65*docente.cargos[n].horas;}
    calcular(n);
}
function elegir_antiguedad() {
    var selectorAntiguedad = document.getElementById("antiguedad");
    docente.antiguedad = Number(selectorAntiguedad.options[selectorAntiguedad.selectedIndex].value);
    if (docente.mes == "") {
        document.getElementById('bruto').innerHTML = "Seleccionar mes";
        document.getElementById('neto').innerHTML = "Seleccionar mes";
    }
    else {
        docente.fijar_mdm();
        calcular(0);
    }
}
function elegir_afiliado() {
    if (document.getElementById("afiliado").checked) {
        DescuentoAdemys = 0.015;
    }
    else {
        DescuentoAdemys = 0;
    }
    calcular(0);
}    
function elegir_presentismo() {
    if (document.getElementById("presentismo").checked) {
        DescuentoPresentismo = 0;
    }
    else {
        DescuentoPresentismo = 0.1;
    }
    calcular(0);
}
function elegir_privada() {
    if (document.getElementById("privada").selectedIndex == 1) {
        Rem = 1 - (DescuentoJubilacion + DescuentoOS + DescuentoCajaComp);
        privada = true;
    }
    else {
        Rem = 1 - (DescuentoJubilacion + DescuentoOS + DescuentoFCompensador);
        privada = false;
    }
    calcular(0);
}
function elegir_asignaciones() {
    checklist = document.getElementsByName("check_asignaciones");
    for(var i = 0; i < checklist.length; i++) {
        if (checklist[i].checked) {
            asignaciones[checklist[i].value] = 1;
        }
        else {
            asignaciones[checklist[i].value] = 0;
        }
    }
    for (id of ["hijo","hijoDiscapacidad"]) {
        asignaciones[id] = Number(document.getElementById(id).value);
    }
    calcular(0);
}

function calcular(n) {

    //si está el detalle viejo lo borro
    if (mostrarDetalle == true) {limpiar_detalle();}

    if ((docente.cargos[n].jornada == "HorasT" || docente.cargos[n].jornada == "HorasM")  && docente.cargos[n].horas <= 0) {
            document.getElementById('bruto').innerHTML = "Ingresar cant. horas";
            document.getElementById('neto').innerHTML = "Ingresar cant. horas";
                    }
    else if (docente.cargos[n].puntaje == 0) {
        document.getElementById('bruto').innerHTML = "Seleccionar cargo";
        document.getElementById('neto').innerHTML = "Seleccionar cargo";
                }
    else if (docente.antiguedad == -1) {
        document.getElementById('bruto').innerHTML = "Seleccionar antigüedad";
        document.getElementById('neto').innerHTML = "Seleccionar antigüedad";
                }
    else if (segundoCargo && docente.cargos[1].puntaje == 0) {
        document.getElementById('bruto').innerHTML = "Seleccionar segundo cargo";
        document.getElementById('neto').innerHTML = "Seleccionar segundo cargo";
                }
    // else if (docente.mes == "") {
    //     document.getElementById('bruto').innerHTML = "Seleccionar mes";
    //     document.getElementById('neto').innerHTML = "Seleccionar mes";
    //             }
    else {
        docente.calcular_sueldo_docente();
        document.getElementById('bruto').innerHTML = Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(docente.sueldoBruto);	
        document.getElementById('neto').innerHTML = Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(docente.sueldoNeto);

        //Si está activado el detalle lo muestro
        if (mostrarDetalle == true) {            mostrar_detalle();        }
    }
    //Si hay un mes seleccionado muestro la caida
    if (mes != "") {mostrar_caida(mes);}
}
function mostrar(event) {
    event.preventDefault();
    calcular(0);
}
function mostrar_detalle() {
    //Si ya había algo lo limpio
    var divDetalle = limpiar_detalle();

    titulo1 = document.createElement("h4");
    titulo1.innerHTML = "Cifras remunerativas";
    divDetalle.appendChild(titulo1);
    var remus = document.createElement("dl");
    divDetalle.appendChild(remus);

    titulo2 = document.createElement("h4");
    titulo2.innerHTML = "Cifras no remunerativas";
    divDetalle.appendChild(titulo2);
    var noremus = document.createElement("dl");
    divDetalle.appendChild(noremus);

    titulo3 = document.createElement("h4");
    titulo3.innerHTML = "Descuentos";
    divDetalle.appendChild(titulo3);
    var descuentos = document.createElement("dl");
    divDetalle.appendChild(descuentos);

    titulo4 = document.createElement("h4");
    titulo4.innerHTML = "Asignaciones Familiares";
    divDetalle.appendChild(titulo4);
    var asignaciones = document.createElement("dl");
    divDetalle.appendChild(asignaciones);

    
    for (item of docente.detalle()) {
        dt = document.createElement("dt");
        dt.innerHTML = item.nombre+": "+item.monto;
        if (item.tipo == 'r') {
            remus.appendChild(dt);	
        }
        else if (item.tipo == 'nr') {
            noremus.appendChild(dt);
        }
        else if (item.tipo == 'd') {
            descuentos.appendChild(dt);
        }
        else if (item.tipo == 'a') {
            asignaciones.appendChild(dt);
        }
        if (item.descripcion) {
            descripcion = document.createElement("dd");
            descripcion.innerHTML = "-> "+item.descripcion;
            dt.append(descripcion);
        }
    }
}
function limpiar_detalle() {
    var divDetalle = document.getElementById("detalle");
    while (divDetalle.hasChildNodes()) {divDetalle.removeChild(divDetalle.firstElementChild)};
    return(divDetalle);
}

function activar_detalle() {
    if (mostrarDetalle == false) {
        var divDetalle = document.createElement("div");
        divDetalle.setAttribute("id","detalle");
        divDetalle.setAttribute("class","detalle");
        document.getElementById("calculadora").appendChild(divDetalle);
        mostrar_detalle()
        mostrarDetalle = true;
        document.getElementById("botondetalle").innerHTML = "Ocultar detalle"
    }
    else {
        if (document.getElementById("detalle") != null) {document.getElementById("detalle").remove();}
        mostrarDetalle = false;
        document.getElementById("botondetalle").innerHTML = "Mostrar detalle"
    }
}
function agregar_cargo() {
    if (segundoCargo == false) {
        var formu = document.getElementById("formu0").cloneNode(true);
        //le pongo 1 a todos los id
        formu.setAttribute("id","formu1");
        formu.childNodes.forEach(
            function (node) {
                if (node.id != undefined) {
                if (node.id == "antiguedad" || node.id == "afiliado" || node.id == "privada"  || node.id == "presentismo" || node.id == "") {
                    formu.removeChild(node);
                }
                else {
                    node.id = node.id.substring(0,node.id.length-1) + "1";
                    if (node.getAttribute("class") == "oculto0") {
                        node.setAttribute("class","oculto1");
                        node.style.display = "none";
                    }
                }
            }}
        )
        var p = document.createElement('p');
        p.setAttribute("id","leyenda");
        p.innerText = "*Se muestra el total que deberías cobrar por la suma de los cargos teniendo en cuenta los topes.";

        var calculadora = document.getElementById("calculadora");
        calculadora.insertBefore(p,document.getElementById("botondetalle"));
        calculadora.insertBefore(formu,document.getElementById("resultado"));
        document.getElementById("botoncargo").innerHTML = "-";
        document.getElementById("textocargo").innerHTML = "Eliminar segundo cargo";
        segundoCargo = true;	
        docente.cargos.push(new Cargo(docente))
    }
    else {
        document.getElementById("formu1").remove();
        document.getElementById("leyenda").remove();
        document.getElementById("botoncargo").innerHTML = "+";
        document.getElementById("textocargo").innerHTML = "Agregar otro cargo";
        segundoCargo = false; 
        docente.cargos.pop()
        calcular(0);
    }
}
function agregar_asignaciones() {
    if (mostrarAsignaciones == false) {
        document.getElementById("asignaciones").style.display = "block";
        document.getElementById("botonasignaciones").innerHTML = "Ocultar asignaciones";
        //document.getElementById("textoasignaciones").innerHTML = ;
        mostrarAsignaciones = true;
    }
    else {
        document.getElementById("asignaciones").style.display = "none";
        document.getElementById("botonasignaciones").innerHTML = "Asignaciones familiares";
        //document.getElementById("textoasignaciones").innerHTML = "Asignaciones familiares";
        mostrarAsignaciones = false;
        calcular(0);
    }
}


function elegir_mes(evt) {
    
    mes = evt.target.value;
    if (mes) {mostrar_caida(mes);}
    else {
        var resultadoPerdida = document.getElementById("resultado-perdida");
        while (resultadoPerdida.firstChild) resultadoPerdida.removeChild(resultadoPerdida.firstChild);
    }
    // docente.valoresJC = valor_items[mes];
    // docente.fijar_mdm();
    // calcular(0);
}

function mostrar_caida(mes) {
    //borro lo que había
    var resultadoPerdida = document.getElementById("resultado-perdida");
    while (resultadoPerdida.firstChild) resultadoPerdida.removeChild(resultadoPerdida.firstChild);
    
    var inflacion = ipc[MES_ACTUAL]/ipc[mes];
    var p1 = document.createElement('p');
    p1.innerHTML =  "La <span style='color:red; font-weight:bold;'>inflación acumulada</span> desde "+mes+" fue de <span style='color:red; font-weight:bold;'>"+((inflacion-1)*100).toFixed(1)+"%</span>*";
    document.getElementById("resultado-perdida").appendChild(p1);

    if (docente.calculado) {
        var docente_ = docente.clone(mes);
        var sueldoInflacionado = docente_.sueldoNeto*inflacion;
        var perdida = -1+docente.sueldoNeto/sueldoInflacionado;
        var aumento = sueldoInflacionado/docente.sueldoNeto-1;

        var p2 = document.createElement('p');
        p2.innerHTML =  "De haberse actualizado tu sueldo de "+mes+" siguiendo la inflación ahora <b> deberías cobrar "
        +Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(sueldoInflacionado)+".</b>";
        document.getElementById("resultado-perdida").appendChild(p2);

        var p3 = document.createElement('p');
        p3.innerHTML =  "Significa una pérdida de <span style='color:red; font-weight:bold;'>"+Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0})
        .format(sueldoInflacionado-docente.sueldoNeto)+"</span> a valores actuales.";
        //"Significa que tu salario real cayó <span style='color:red; font-weight:bold;'>"+(perdida*100).toFixed(1)+"%</span>."+
        
        document.getElementById("resultado-perdida").appendChild(p3);

        var p4 = document.createElement('p');
        p4.innerHTML = "Para recuperar lo perdido, necesitarías un aumento de <span style='color:orange; font-weight:bold;'>"+(aumento*100).toFixed(1)+"%</span>.";
        document.getElementById("resultado-perdida").appendChild(p4);
    }
    else {
        var p2 = document.createElement('p');
        p2.style.color = "grey";
        p2.innerHTML =  "Para calcular la caída salarial, ingresá tus cargos";
        document.getElementById("resultado-perdida").appendChild(p2);
    }
    var p5 = document.createElement('p');
    p5.innerHTML =  "*Fuente: Instituto de Estadística y Censos de la Ciudad de Buenos Aires";
    p5.style.fontSize = "small";
    document.getElementById("resultado-perdida").appendChild(p5);
}