var ITEMS;
fetch('https://raw.githubusercontent.com/juanwinograd/CalculadoraAdemys/main/valoritems.json')
    .then(response => response.json())
    .then(data => {
        ITEMS = data;
    })
    .catch(error => console.error('Error loading JSON:', error));

const lista = ["Opción 1", "Opción 2", "Opción 3", "Opción 4"];
var select = document.createElement('select');
lista.forEach(opcion => { const optionElement = document.createElement("option"); optionElement.value = opcion; optionElement.textContent = opcion; select.appendChild(optionElement); });
document.getElementById("contenedor-mes").appendChild(select);

const DescuentoOS = 0.06, DescuentoJubilacion = 0.13, DescuentoFCompensador = 0.003, DescuentoCajaComp = 0.045;
var Rem = 1 - (DescuentoOS + DescuentoJubilacion + DescuentoFCompensador);
var DescuentoAdemys = 0, DescuentoPresentismo = 0;

//Valores para JC
const PuntoIndice = 153.66,
Dec483 = 435796,
Dec483Piso = 416078,
SumaFija = 60000,
AdicionalEspecial = 68000,
FONID = 0,
Conectividad = 0,
AdicionalExtendida = 108239,
MDM0_60 = 268578,
MDM0_60Piso = 257716,
MDM70_120 = 332804,
MDM70_120Piso = 319364,
SalarioMinimo = 1184314,
SalarioMinimoPiso = 961058,
SalarioMinimoPisoJS = 380797;

const AumentoAsignaciones = 1.2375*1.25625*1.5641*1.5*1.8666667*1.68;
const ValorUMAF = 50*AumentoAsignaciones;
const TopesAsignaciones = [60000*AumentoAsignaciones,87500*AumentoAsignaciones,114500*AumentoAsignaciones];
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

var items = {basico : {nombre : "Sueldo Básico", tope : 0, tipo : 'r', descripcion : "Sueldo básico de acuerdo al cargo"},
            jerarquizacion : {nombre : "Plus Jerarquización", tope: 0, tipo : 'r', descripcion : "En general es el 15% del básico. Para directorxs hay un plus adicional que dependiendo de la cantidad de turnos y secciones puede ser 6, 10 o 15%, acá sumamos el 6%"},
            dedicacionExclusiva : {nombre : "Dedicación Exclusiva", tope: 0, tipo : 'r', descripcion : "Plus para rectorx de media de 40 horas semanales"},
            antiguedadBasico : {nombre : "Antigüedad", tope: 0, tipo : 'r', descripcion : "Antigüedad sobre el básico"},
            presentismo : {nombre : "Adicional Salarial", tope: 0, tipo : 'r', descripcion : "Presentismo: 10% del básico y del Decreto 483/05. Se paga con un mes de atraso."},
            dec483 : {nombre : "Suma Decreto 483/05", tope: Dec483, tipo : 'r', descripcion : "$"+(Dec483/2)+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs"},
            antiguedadDec483 : {nombre : "Antigüedad Dec. 483", tope: Dec483, tipo : 'r', descripcion :  "Antigüedad sobre el Decreto 483/05"},
            mdm : {nombre : "Material Didáctico Mensual", tope: 0, tipo : 'nr', descripcion :  ""},
            minimo : {nombre : "Salario Mínimo", tope: SalarioMinimo, tipo : 'minimo'},
            cmg : {nombre : "Complemento Mínimo Garantizado", tope: 0, tipo : 'nr', descripcion :  "Es la diferencia entre lo que sería tu sueldo por antigüedad y el salario mínimo docente"},
            adicionalEsp : {nombre : "Compensación Fija Proporcional", tope: AdicionalEspecial, tipo : 'nr', descripcion :  "$"+(AdicionalEspecial/2)+" por cargo simple o 15hs. Se paga hasta dos cargos o 30hs"},
            fonid : {nombre : "Fo.Na.In.Do", tope: FONID, tipo : 'nr', descripcion :  "$"+(FONID/2)+" por cargo simple o 15hs. Se paga hasta dos cargos o 30hs"},
            conectividad : {nombre : "Compensación Transitoria", tope: Conectividad, tipo : 'nr', descripcion :  "(reemplazó al item Conectividad) $"+(Conectividad/2)+" por cargo simple o 15hs. Se paga hasta dos cargos o 30hs"},
            sumaFija : {nombre : "Suma Fija", tope: SumaFija, tipo : 'nr', descripcion :  "$"+(SumaFija/2)+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs"},
            adicionalExtendida : {nombre : "Adicional Turno Extendido", tope: AdicionalExtendida, tipo : 'nr', descripcion :  "Adicional de $"+(AdicionalExtendida)+" para el cargo de turno extendido de Primera Infancia"},
            supleEscRec : {nombre : "Suplemento Esc. Recupración", tope: 0, tipo : 'r', descripcion :  "15% sobre las sumas bonificables, para docentes de Especial."},
            sueldoBruto : {nombre : "Sueldo Bruto", tope: 0, tipo : 's'},
            descuentoOS : {nombre : "Obra Social", tope: 0, tipo : 'd', descripcion :  "6% de las cifras remunerativa. Son dos items: 3% para la obra social y otro 3% para otorgar cobertura a jubilados."},
            descuentoJubilacion : {nombre : "Jubilación", tope: 0, tipo : 'd', descripcion :  "13% de las cifras remunerativas. 11% del régimen general más un 2% del régimen especial docente."},
            descuentoFCompensador : {nombre : "Fondo Compensador", tope: 0, tipo : 'd', descripcion :  "0,3% de las cifras remunerativas. Es un seguro de vida obligatorio."},
            descuentoCajaComp : {nombre : "Caja Complementaria", tope: 0, tipo : 'd', descripcion :  "4,5% de las cifras remunerativas. Es un aporte extra para acceder a un complemento a la jubilación. Se aplica por defecto a los docentes de privada."},
            descuentoAdemys : {nombre : "ADEMYS", tope: 0, tipo : 'd', descripcion :  "1,5% de las cifras remunerativas y del C.M.G."},
            descuentoPresentismo : {nombre : "Desc. Adicional Salarial", tope: 0, tipo : 'd', descripcion :  "Presentismo: 10% del básico y del Decreto 483/05. Se descuenta con un mes de atraso."},
            sueldoNeto : {nombre : "Sueldo Neto", tope: 0, tipo : 's'},
            hijo : {nombre: 'Asignación Hijo/a', tope : 0, tipo : 'a'},
            hijoDiscapacidad : {nombre: 'Asignación Hijo/a con discapacidad', tope : 0, tipo : 'a'},
            embarazo : {nombre: 'Asignación por embarazo', tope : 0, tipo : 'a'},
            conviviente : {nombre: 'Asignación por conyugüe o conviviente', tope : 0, tipo : 'a'}
        };


var MDM, MDMPiso;

var mostrarDetalle = false, segundoCargo = false, mostrarAsignaciones = false;

var privada = false;
var antiguedad = -1; //esto podría ser una propiedad del docente. pensar
var asignaciones = {
            embarazo : 0,
            conviviente : 0,
            hijo : 0,
            hijoDiscapacidad : 0
};
var docente = new Docente(asignaciones);

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

//calcula el valor de cada item para el cargo
function calcular_items() {		
    
    var proporcion;
        
    if (this.jornada == "JS") {
        this.dec483 = Dec483/2; this.fonid = FONID/2; this.conectividad = Conectividad/2; this.adicionalEsp = AdicionalEspecial/2; this.minimo = SalarioMinimo/2; this.mdm = MDM/2;
        this.sumaFija = SumaFija/2;

        proporcion = this.puntaje/1135;
        // si el puntaje es menor a 1135 hago proporcional a menos que quede por debajo del piso
        if (proporcion < 1) {
            if (this.dec483*proporcion > Dec483Piso/2) {this.dec483 = Dec483/2*proporcion;} else {this.dec483 = Dec483Piso/2;}
            if (this.minimo*proporcion > SalarioMinimoPisoJS) {this.minimo = SalarioMinimo/2*proporcion;} else {this.minimo = SalarioMinimoPisoJS}
            if (this.mdm*proporcion > MDMPiso/2) {this.mdm = MDM/2*proporcion;} else {this.mdm = MDMPiso/2;}
            this.sumaFija = this.sumaFija*proporcion;
        }
        if (this.horas > 0) {   	   			
            this.adicionalEsp = item_horas(this.horas,30,AdicionalEspecial);
            this.fonid = item_horas(this.horas,30,FONID);
            this.conectividad = item_horas(this.horas,30,Conectividad);
        }
    }
    else if (this.jornada == "JC") {
        this.dec483 = Dec483; this.fonid = FONID; this.conectividad = Conectividad; this.adicionalEsp = AdicionalEspecial; this.minimo = SalarioMinimo; this.mdm = MDM;
        this.sumaFija = SumaFija;

        proporcion = this.puntaje/2070;
        if (proporcion < 1) {
            if (this.dec483*proporcion > Dec483Piso) {this.dec483 = Dec483*proporcion;} else {this.dec483 = Dec483Piso;}
            if (this.minimo*proporcion > SalarioMinimoPiso) {this.minimo = SalarioMinimo*proporcion;} else {this.minimo = SalarioMinimoPiso;}
            if (this.mdm*proporcion > MDMPiso) {this.mdm = MDM*proporcion;} else {this.mdm = MDMPiso;}
            this.sumaFija = SumaFija*proporcion;
        }
    }
    // horas    	   	
    else if (this.jornada == "HorasM") {
        this.dec483 = item_horas(this.horas,38,Dec483);
        this.mdm = item_horas(this.horas,38,MDM);
        this.sumaFija = item_horas(this.horas,38,SumaFija);
        this.adicionalEsp = item_horas(this.horas,30,AdicionalEspecial);
        this.fonid = item_horas(this.horas,30,FONID);
        this.conectividad = item_horas(this.horas,30,Conectividad);
        this.minimo = item_horas(this.horas,40,SalarioMinimo);
    }
    else if (this.jornada == "HorasT") {
        this.dec483 = item_horas(this.horas,38,Dec483);
        this.mdm = item_horas(this.horas,38,MDM);
        this.sumaFija = item_horas(this.horas,38,SumaFija);
        this.adicionalEsp = item_horas(this.horas,24,AdicionalEspecial);
        this.fonid = item_horas(this.horas,24,FONID);
        this.conectividad = item_horas(this.horas,24,Conectividad);
        this.minimo = item_horas(this.horas,40,SalarioMinimo);
    }
    //basico
    this.basico =  this.puntaje*PuntoIndice;

    //si no corresponde los plus son 0	
    this.jerarquizacion = this.basico*this.plus;
    this.dedicacionExclusiva = this.plusExclusiva*PuntoIndice;
    this.supleEscRec = (this.basico+this.dec483)*this.plusEscRecuperacion;
    
    //Jerarquizacion y su proporcional del presentismo no cuentan para cmg
    // this.minimo = this.minimo + this.jerarquizacion*1.1*Rem;


    this.antiguedadBasico = (this.basico + this.jerarquizacion + this.dedicacionExclusiva)*antiguedad;
    this.antiguedadDec483 = this.dec483*antiguedad
}

//calcula el sueldo para un cargo
function calcular_sueldo() {
    

    //sumo las cifras remunerativas
    this.sinCMG = (this.basico*1.1 + this.dec483*1.1 + this.antiguedadBasico + this.antiguedadDec483 + this.supleEscRec)*Rem;

    //segun antiguedad mdm es remunerativo o no
    if (antiguedad >= 0.5)
        this.sinCMG = this.sinCMG + this.mdm*Rem;
    else
        this.sinCMG = this.sinCMG + this.mdm
        
    //si quedo por debajo del minimo, la diferencia me da el cmg
    if (this.sinCMG < this.minimo) {this.cmg = this.minimo - this.sinCMG}
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
    if (antiguedad >= 0.5) this.remus = this.remus + this.mdm;

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
    this.sueldoBruto = this.remus + this.fonid + this.conectividad + this.adicionalEsp + this.cmg + this.sumaFija;
    if (antiguedad < 0.5) this.sueldoBruto = this.sueldoBruto + this.mdm;

    //Primera Infancia
    if (this.adicionalExtendida > 0) {this.sueldoBruto = this.sueldoBruto + this.adicionalExtendida;}
            
    //para el neto resto los descuentos
    this.sueldoNeto = this.sueldoBruto + this.descuentoTotal;
}
function valor_items() {
    var valores = new Object();
    for (key in items) {
        valores[key] = this[key];
    }
    return(valores)
}
/*
valor_items = {};
valor_items[Symbol.iterator] = function() {
    return {
        
        next() {
        n += 10;
        if (n == 100) {done = true}
        return {value:n, done:done};
    }
};
}*/

function Cargo(area,jornada,puntaje = 0,horas = 0,plus = 0,plusEscRecuperacion = 0, plusExclusiva = 0) {
    this.area = area;
    this.jornada = jornada;
    this.puntaje = puntaje;
    this.horas = horas;
    this.plus = plus;
    this.plusEscRecuperacion = plusEscRecuperacion;
    this.plusExclusiva = plusExclusiva;
    this.calcular_items = calcular_items;
    this.calcular_sueldo = calcular_sueldo;
    this.valor_items = valor_items;
}

//suma todos los cargos de un docente
function sumar_cargos() {
    for (key in items) {
        let suma = 0;
        for (cargo of this.cargos) {
            suma += cargo[key];
        }
        if (suma < items[key].tope || items[key].tope == 0) {
            this[key] = suma;
        }
        else {
            this[key] = items[key].tope;			
        }		
    }
    this.calcular_sueldo();
}

//calcula el sueldo de un docente con 1 o más cargos
function calcular_sueldo_docente() {
    for (cargo of this.cargos) {
        cargo.calcular_items();
    }
    this.sumar_cargos();
    this.calcular_sueldo();        
    this.sumar_asignaciones();
}    

//suma asigaciones segun ley octubre 2021
function sumar_asignaciones() {
    let franja;
    let sueldo = this.sueldoBruto;
    if (sueldo >= TopesAsignaciones[2]) {
        for (asignacion in this.asignaciones) { 
            this[asignacion] = MontosAsignaciones[asignacion][3]*this.asignaciones[asignacion]; 
            items[asignacion].descripcion = "Superaste el tope puesto por la nueva ley. Si venías cobrando de antes, tenés que seguir cobrando el mismo monto"
        }
    }
    else {
        if (sueldo >= TopesAsignaciones[1])
            franja = 2;
        else if (sueldo >= TopesAsignaciones[0])
            franja = 1;
        else
            franja = 0;
        for (asignacion in this.asignaciones) {
            this[asignacion] = MontosAsignaciones[asignacion][franja]*ValorUMAF*this.asignaciones[asignacion];
            // if (this.horas < 18) {this[asignacion] = this.asignacion*0.5;}
            this.sueldoBruto += this[asignacion];
            this.sueldoNeto += this[asignacion];
        }
    }
}

//muestra un detalle del sueldo
function detalle() {
    var detalle = [];
    for (key in items) {
        if (key != "minimo" && this[key] != undefined && this[key] != 0) {
            let item = {nombre: items[key].nombre,monto: Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(this[key]),tipo: items[key].tipo, descripcion: items[key].descripcion}
            if (this[key] == items[key].tope) {
                item.max = true;
            }
            detalle.push(item);
        }
    }
    return(detalle);
}

function Docente(asignaciones) {
    //this.antiguedad = antiguedad;
    //this.cargo1 = new Cargo();
    //this.cargo2 = new Cargo();
    this.cargos = [new Cargo()];
    this.asignaciones = asignaciones;        
    this.calcular_sueldo = calcular_sueldo;
    this.sumar_cargos = sumar_cargos;
    this.sumar_asignaciones = sumar_asignaciones;
    this.calcular_sueldo_docente = calcular_sueldo_docente;
    this.detalle = detalle;
}


function elegir_area(evt) {	
    var id = evt.target.id;
    var n = id[id.length-1];
    docente.cargos[n].puntaje = 0; docente.cargos[n].horas = 0; docente.cargos[n].plus = 0; docente.cargos[n].plusEscRecuperacion = 0;
    docente.cargos[n].adicionalExtendida = 0; docente.cargos[n].plusExclusiva = 0;
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
    if (docente.cargos[n].puntaje == 1368) { docente.cargos[n].adicionalExtendida = AdicionalExtendida}
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
    antiguedad = Number(selectorAntiguedad.options[selectorAntiguedad.selectedIndex].value);
    if (antiguedad <= 0.4)	{
        MDM = MDM0_60; MDMPiso = MDM0_60Piso;
        items.mdm.tipo = 'nr';
        items.mdm.descripcion = "Hasta los 6 años antigüedad son $"+MDM/2+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs";
    }
    else {
        MDM = MDM70_120; MDMPiso = MDM70_120Piso;
        items.mdm.tipo = 'r';
        items.mdm.descripcion = "Desde los 7 años antigüedad son $"+MDM/2+" por cargo simple o 19hs. Se paga hasta dos cargos o 38hs"
    }
    items.mdm.tope = MDM;
    items.antiguedadDec483.tope = Dec483*antiguedad;
    calcular(0);
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

    /*if (document.getElementById("privada").checked) {
        Rem = 1 - (DescuentoJubilacion + DescuentoOS + DescuentoCajaComp);
        privada = true;
    }
    else {
        Rem = 1 - (DescuentoJubilacion + DescuentoOS + DescuentoFCompensador);
        privada = false;
    }*/
    calcular(0);
}
function elegir_asignaciones() {
    checklist = document.getElementsByName("check_asignaciones");
    for(var i = 0; i < checklist.length; i++) {
        if (checklist[i].checked) {
            docente.asignaciones[checklist[i].value] = 1;
        }
        else {
            docente.asignaciones[checklist[i].value] = 0;
        }
    }
    for (id of ["hijo","hijoDiscapacidad"]) {
        docente.asignaciones[id] = document.getElementById(id).value;
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
    else if (antiguedad == -1 )	{
        document.getElementById('bruto').innerHTML = "Seleccionar antigüedad";
        document.getElementById('neto').innerHTML = "Seleccionar antigüedad";
                }
    else if (segundoCargo && docente.cargos[1].puntaje == 0) {
        document.getElementById('bruto').innerHTML = "Seleccionar segundo cargo";
        document.getElementById('neto').innerHTML = "Seleccionar segundo cargo";
                }        
    else {
        docente.calcular_sueldo_docente();
        document.getElementById('bruto').innerHTML = Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(docente.sueldoBruto);	
        document.getElementById('neto').innerHTML = Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits:0}).format(docente.sueldoNeto);
        if (mostrarDetalle == true) {
            mostrar_detalle();
        }
    }
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
        document.body.appendChild(divDetalle);
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
        p.innerText = "*Se muestra el total que deberías cobrar por la suma de los cargos teniendo en cuenta los topes. Como se distribuyen los montos entre los distintos recibos puede variar.";
        document.body.insertBefore(p,document.getElementById("botondetalle"));
        document.body.insertBefore(formu,document.getElementById("botonasignaciones"));
        document.getElementById("botoncargo").innerHTML = "-";
        document.getElementById("textocargo").innerHTML = "Eliminar segundo cargo";
        segundoCargo = true;	
        docente.cargos.push(new Cargo())
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
