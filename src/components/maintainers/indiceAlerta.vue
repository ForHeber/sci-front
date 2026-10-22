<template>
  <v-container fluid :class="{ 'maintainer-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
<!-- Lista de tipo de ingesta -->            
      <v-container fluid>
        <v-data-table
          class        = "tabla"        
          :headers     = "headers"
          :loading     = "isLoading"
          loading-text = "Cargando... por favor espere"
          :items       = "indicesAlertas"
          disable-pagination
          hide-default-footer
        >
        <template v-slot:header.alertA_VERDE="{ header }">
          <v-icon small left color="success">mdi-circle</v-icon>
          {{ header.text }}
        </template>
        <template v-slot:header.alertA_AMARILLA="{ header }">
          <v-icon small left color="warning">mdi-circle</v-icon>
          {{ header.text }}
        </template>
        <template v-slot:header.alertA_ROJA="{ header }">
          <v-icon small left color="error">mdi-circle</v-icon>
          {{ header.text }}
        </template>
        
<!--
    Acciones
        - Editar 
--> 
          <template v-slot:item.acciones="{ item }"> 
            <div class="tabla-acciones">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    class  = "accion-btn accion-btn--edit" 
                    icon 
                    v-on   = "on" 
                    @click = "editItem(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Editar</span>
              </v-tooltip>
            </div>
          </template>                      
<!--  Mensaje cuando no hay data -->                    
          <template v-slot:no-data>
            No se han encontrado índices de alerta registrados en el sistema
          </template>                           
        </v-data-table> 
      </v-container>  
    </v-card>      
<!--
  👉 alertIndexDialog
      • Componente que permite actualizar antecedentes de indices de alertas
-->                           
    <v-dialog
      v-model    = "alertIndexDialog"
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
      class      = "dialog"
    >
      <v-card :class="{ 'maintainer-dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="text-h5 white--text">{{ formTitle.title }}</span>
          <v-spacer />
        </v-card-title>            
        <v-card-subtitle class="primary">
          <span class="text-h8 white--text">{{ formTitle.subtitle }}</span>
        </v-card-subtitle>

        <v-card-text>
          <v-form v-model = "validForm" ref="form">                    
            <v-container class="mt-2">
              <v-row class="mt-4" dense>
                <v-col cols="12">
                  <div class="panel">
                    <div class="panel-head">
                      <p class="panel-title mb-1">Índices de alerta</p>
                      <p class="panel-subtitle mb-0">
                        Ingrese  valores numéricos expresado en horas
                        como valor límite para desplegar los informes con las alarmas correspondientes de acuerdo a los diferentes niveles de alerta.</p>
                    </div>
                    <v-row class="panel-fields-row" dense> 
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number = "editedItem.alertA_AMARILLA"
                            type           = "number"
                            :label         = "'Alerta Amarilla'"
                            min            ="0"
                            :rules         = "rules.required"
                            required
                            prepend-inner-icon = "mdi-numeric"
                          />
                        </v-col>     
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number = "editedItem.alertA_ROJA"
                            type           = "number"
                            :label         = "'Alerta Roja'"
                            min            ="0"
                            :rules         = "rules.required"
                            required
                            prepend-inner-icon = "mdi-numeric"
                          />
                        </v-col>
                    </v-row>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>                
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color = "secondary"
            text
            outlined
            @click = "alertIndexDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color     = "primary"
            @click    = "save"
            :disabled = "buttonClicked"
          >
            Guardar
          </v-btn>
        </v-card-actions>           
      </v-card>            
    </v-dialog>        
    
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from "vuex"
  import toastr, { error } from 'toastr'
  import 'toastr/build/toastr.min.css' 

  export default {
    name       : "indiceAlerta",   
    props      : {},
    components : {},
    data       : () => ({   
      search                : '',        
      oldSearch             : '',            
      page                  : 1,
      oldPage               : 1,
      items                 : 5,
      alertIndexDialog      : false,
      editedIndex           : -1,
      maxlength             : 50,
      validForm             : false,  
      buttonClicked         : false,
      editedItem            : {
        id              : null,
        tipO_INFORME    : null,
        enPlazo         : null,
        alertA_VERDE    : null,
        alertA_AMARILLA : null,
        alertA_ROJA     : null,
        fueraDePlazo    : null,
      },
      defaultItem           : {
        id              : null,
        tipO_INFORME    : null,
        alertA_VERDE    : null,
        alertA_AMARILLA : null,
        alertA_ROJA     : null,
      },                                                         
      headers               : [
        { text: "Id"               , value: "id"             , groupable: false, sortable: false },
        { text: "Tipo de Informe"  , value: "tipO_INFORME"   , groupable: false, sortable: false },      
        { text: "Alerta Amarilla"  , value: "alertA_AMARILLA", groupable: false, sortable: false },
        { text: "Alerta Roja"      , value: "alertA_ROJA"    , groupable: false, sortable: false },
        { text: "Acciones"         , value: "acciones"       , groupable: false, sortable: false },  
      ],
      rules                     : {
        required      : [
          (v) => !!v || "Este campo es requerido",
        ],
      },

    }),
    async beforeMount() {
      await this.getData()
    },                              
    computed   : {
      ...mapGetters("indiceAlertaStore", [ "indicesAlertas", "pages", "isLoading" ]),                                                                    
      formTitle () {
        return { title: 'Editar Índice de Alerta', subtitle: `Id: ${this.editedItem.id} | Tipo de Informe: ${this.editedItem.tipO_INFORME}` }
      },
    },
    methods    : {
/*
      • getData               : Obtiene la data de índices de alerta desde el store
      • editItem              : Inicializa la edición de un índice de alerta existente
      • save                  : Guarda los cambios de un índice de alerta (nuevo o editado)
      • closeAlertIndexDialog : Cierra el diálogo de índice de alerta
      • validate              : Valida el formulario de índice de alerta
      • resetValidation       : Resetea la validación del formulario
      • lookFor               : Busca índices de alerta según el criterio de búsqueda
*/
      async getData() {
        this.getListMantencionIndicesAlertas()                            
      },            

      async editItem (item) {
        this.resetValidation();
        this.editedIndex      = this.indicesAlertas.indexOf(item);
        this.editedItem       = Object.assign({}, item);
        this.alertIndexDialog = true;
      },   

      async save () {
        this.validate();
        if ( this.validForm ) {
          this.buttonClicked = true
          if (this.editedIndex > -1) {
            await this.putMantencionIndiceAlerta({
              id              : this.editedItem.id,
              tipO_INFORME    : this.editedItem.tipO_INFORME,
              alertA_AMARILLA : this.editedItem.alertA_AMARILLA,
              alertA_ROJA     : this.editedItem.alertA_ROJA,
            })
            .then(async resp => {
              if (resp.status == 200) {
                toastr.success("Se ha actualizado la información correctamente", "Éxito!");
                this.page = 1
                await this.getData()
              } else {
                toastr.error("error", "Ha ocurrido un error", "Error!");
                return;
              }
            });
          }
          this.closeAlertIndexDialog();
        }
      },     

      async closeAlertIndexDialog() {
        this.alertIndexDialog = false    
        this.editedItem      = Object.assign({}, this.defaultItem);
        this.editedIndex     = -1;     
        this.resetValidation()                           
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },                                                
      validate() {
        this.$refs.form.validate();
      },

      resetValidation(){
        if ( this.$refs.form ) this.$refs.form.resetValidation();
      },

      async lookFor(){
        if ( this.search != this.oldSearch ) {
          await this.getData();
          this.oldSearch = this.search;
          this.page      = 1;
        }
      },          

      ...mapActions("indiceAlertaStore", [ "getListMantencionIndicesAlertas", "putMantencionIndiceAlerta" , ]),                                                   
    }                     
  }
</script>
<style scoped>
  
/* Tabla de datos */
  .tabla {
    border: 1px solid #d4e0ec;
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
    display: block;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
  }
  .tabla ::v-deep .v-data-table__wrapper {
    overflow-x: auto;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
  }
  .tabla ::v-deep table {
    width: max-content;
    min-width: 100%;
    margin: 0 auto;
  }
  .tabla ::v-deep thead tr {
    background: #edf4fb;
  }
  .tabla ::v-deep th {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #2b4963;
    white-space: nowrap;
  }
  .tabla ::v-deep tbody td {
    font-size: 0.82rem;
    font-weight: 300;
    color: #2f4359;
    vertical-align: top;
  }
  .tabla ::v-deep tbody tr:nth-child(even) {
    background-color: #fbfdff;
  }
  .tabla ::v-deep tbody tr:hover {
    background-color: #f1f7fe;
  }
  .tabla-acciones {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    min-width: 100px;
  }
  .tabla-acciones ::v-deep .v-btn--icon {
    width: 36px;
    height: 36px;
  }
  .tabla-acciones ::v-deep .accion-btn {
    position: relative;
    width: 37px;
    height: 37px;
    min-width: 37px;
    border-radius: 10px;
    border: 1px solid #cfdae6;
    background: linear-gradient(180deg, #ffffff 0%, #f4f8fc 100%);
    box-shadow: 0 1px 2px rgba(25, 56, 84, 0.08);
    transition: all 0.18s ease;
  }
  .tabla-acciones ::v-deep .accion-btn .v-icon {
    font-size: 17px;
    opacity: 0.95;
    transition: color 0.18s ease;
  }
  .tabla-acciones ::v-deep .accion-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(24, 62, 96, 0.14);
  }
  .tabla-acciones ::v-deep .accion-btn:disabled,
  .tabla-acciones ::v-deep .accion-btn.v-btn--disabled {
    opacity: 0.42;
    box-shadow: none;
    transform: none;
    border-color: #d8e2ec;
  }
  .tabla-acciones ::v-deep .accion-btn--edit .v-icon     { color: #2c6281; }
  .tabla-acciones ::v-deep .accion-btn--delete .v-icon   { color: #a1462f; }
  .tabla-acciones ::v-deep .accion-btn--edit:hover     { border-color: #8fb5cc; background: #ebf4fb; }
  .tabla-acciones ::v-deep .accion-btn--delete:hover   { border-color: #bf8673; background: #f5e8e2; }
  
  /* Dialogs */
  .dialog {
    font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
    --form-control-font-size: 0.84rem;
    --dialog-primary: #0b3c5d;
    --dialog-primary-soft: #16527b;
    --dialog-accent: #f4b400;
    --dialog-surface: #f5f9fd;
    --dialog-border: #d3deea;
  }
  .dialog ::v-deep .v-card {
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 20px 44px rgba(11, 60, 93, 0.2);
    background: linear-gradient(180deg, #fafdff 0%, #f3f8fe 100%);
  }
  .dialog ::v-deep .v-card__title.primary,
  .dialog ::v-deep .v-card__subtitle.primary {
    background: linear-gradient(115deg, var(--dialog-primary) 0%, var(--dialog-primary-soft) 68%, #1d628f 100%) !important;
  }
  .dialog ::v-deep .v-card__title .text-h5 {
    font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
    font-weight: 500;
    letter-spacing: 0.03em;
    text-transform: capitalize;
  }
  .dialog ::v-deep .v-card__subtitle .text-h8 {
    font-weight: 300;
    letter-spacing: 0.03em;
    opacity: 0.95;
  }
  .dialog ::v-deep .v-label,
  .dialog ::v-deep .v-input input,
  .dialog ::v-deep .v-input textarea,
  .dialog ::v-deep .v-btn {
    font-family: "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif;
    letter-spacing: 0.012em;
    font-weight: 300;
  }
  .dialog ::v-deep .v-input .v-label,
  .dialog ::v-deep .v-input input,
  .dialog ::v-deep .v-input textarea,
  .dialog ::v-deep .v-select__selection,
  .dialog ::v-deep .v-select__selections {
    font-size: var(--form-control-font-size) !important;
  }
  .dialog ::v-deep .v-icon {
    font-size : 13px;
    color     : #60758b;
    opacity   : 0.82;
  }
  .dialog ::v-deep .v-tab .v-icon {
    font-size : 13px !important;
    opacity   : 0.8;
  }
  .dialog ::v-deep .v-input__prepend-inner .v-icon {
    font-size        : 13px !important;
    color            : #7d90a3;
    opacity          : 0.66;
    transform        : scale(0.9);
    transform-origin : center;
  }
  .dialog ::v-deep .v-input__append-inner .v-icon {
    font-size : 13px !important;
    color     : #70859a;
    opacity   : 0.72;
  }
  .dialog ::v-deep .v-btn .v-icon {
    font-size : 13px !important;
  }
  .dialog ::v-deep .v-btn {
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.03em;
    text-transform: none;
  }
/* Panel */  
  .panel {
    padding: 15px;
    border-radius: 16px;
    background: linear-gradient(136deg, #f9fcff 0%, #eef4fb 58%, #f8fcff 100%);
    border: 1px solid #d5e1ed;
    box-shadow: 0 12px 26px rgba(23, 53, 82, 0.08);
  }
  .panel-head {
    padding: 0 2px 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(130, 152, 176, 0.22);
  }
  .panel-title {
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: 0.028em;
    color: #253f57;
  }
  .panel-subtitle {
    font-size: 0.8rem;
    line-height: 1.35;
    color: #60758b;
  }
  .panel-fields-row {
    margin: 0;
  }
  .panel ::v-deep .v-input__slot {
    border-radius: 11px !important;
    background-color: rgba(255, 255, 255, 0.94);
  }
  .panel ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 3px rgba(11, 60, 93, 0.1);
  }
  .panel ::v-deep .v-text-field--outlined fieldset {
    border-color: #bdccdb;
  }
  .panel ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #0b3c5d;
  }
  .panel ::v-deep .v-label {
    color: #29425b;
    letter-spacing: 0.012em;
    font-weight: 400;
  }
  .panel ::v-deep .v-counter {
    color: #6b7f95;
  }  
/* Modo oscuro exclusivo de este mantenedor */
  .maintainer-dark {
    --maintainer-surface: #242628;
    --maintainer-surface-raised: #2b2e30;
    --maintainer-surface-hover: #363b3f;
    --maintainer-border: #45494d;
    --maintainer-text: #d4d8dc;
    --maintainer-text-muted: #aeb8c0;
    color: var(--maintainer-text);
  }
  .maintainer-dark .toolbar {
    border-bottom-color: var(--maintainer-border);
  }
  .maintainer-dark ::v-deep .toolbar .v-label,
  .maintainer-dark ::v-deep .toolbar input,
  .maintainer-dark ::v-deep .toolbar .v-select__selection,
  .maintainer-dark ::v-deep .toolbar .v-icon {
    color: var(--maintainer-text);
  }
  .maintainer-dark ::v-deep > .v-card,
  .maintainer-dark ::v-deep .tabla,
  .maintainer-dark ::v-deep .tabla .v-data-table__wrapper,
  .maintainer-dark ::v-deep .tabla table {
    background-color: var(--maintainer-surface) !important;
    border-color: var(--maintainer-border) !important;
  }
  .maintainer-dark ::v-deep .tabla thead tr,
  .maintainer-dark ::v-deep .tabla thead th {
    background: #2b2f32 !important;
    color: #dce4e9 !important;
  }
  .maintainer-dark ::v-deep .tabla tbody tr,
  .maintainer-dark ::v-deep .tabla tbody td {
    background-color: var(--maintainer-surface) !important;
    color: var(--maintainer-text) !important;
  }
  .maintainer-dark ::v-deep .tabla tbody tr:nth-child(even),
  .maintainer-dark ::v-deep .tabla tbody tr:nth-child(even) > td {
    background-color: #292c2f !important;
  }
  .maintainer-dark ::v-deep .tabla tbody tr:hover,
  .maintainer-dark ::v-deep .tabla tbody tr:hover > td {
    background-color: var(--maintainer-surface-hover) !important;
  }
  .maintainer-dark ::v-deep .tabla .v-data-table__empty-wrapper,
  .maintainer-dark ::v-deep .tabla .v-data-table__progress {
    color: var(--maintainer-text-muted) !important;
    background-color: var(--maintainer-surface) !important;
  }
  .maintainer-dark ::v-deep .accion-btn {
    border-color: #51575c !important;
    background: linear-gradient(180deg, #34383b 0%, #292c2f 100%) !important;
  }
  .maintainer-dark ::v-deep .accion-btn:hover {
    border-color: #89959e !important;
    background: #3b4247 !important;
  }
  .maintainer-dark ::v-deep .accion-btn--edit .v-icon { color: #94c4ee; }
  .maintainer-dark ::v-deep .accion-btn--delete .v-icon { color: #ee9d9d; }
  .maintainer-dark ::v-deep .accion-btn.v-btn--disabled {
    border-color: var(--maintainer-border);
  }
  .maintainer-dark.v-card,
  .maintainer-dark.v-card .v-card__text,
  .maintainer-dark.v-card .v-card__actions {
    background: var(--maintainer-surface) !important;
    color: var(--maintainer-text);
  }
  .maintainer-dark .panel {
    background: var(--maintainer-surface-raised);
    border-color: var(--maintainer-border);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  .maintainer-dark .panel-head {
    border-bottom-color: var(--maintainer-border);
  }
  .maintainer-dark .panel-title,
  .maintainer-dark .panel-subtitle,
  .maintainer-dark .panel ::v-deep .v-label,
  .maintainer-dark .panel ::v-deep .v-counter {
    color: var(--maintainer-text-muted);
  }
  .maintainer-dark .panel-title {
    color: #e1e5e8;
  }
  .maintainer-dark .panel ::v-deep .v-input__slot {
    background-color: var(--maintainer-surface) !important;
  }
  .maintainer-dark .panel ::v-deep .v-input input,
  .maintainer-dark .panel ::v-deep .v-input textarea,
  .maintainer-dark .panel ::v-deep .v-select__selection {
    color: var(--maintainer-text);
  }
  .maintainer-dark ::v-deep .v-label {
    color: #c8d0d6;
  }
  .maintainer-dark ::v-deep .v-text-field--outlined fieldset {
    border-color: #69747c;
  }
  .maintainer-dark ::v-deep .v-text-field--is-focused.v-input--is-focused fieldset {
    border-color: #a6c9dc;
  }
  .maintainer-dark ::v-deep .v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(166, 201, 220, 0.15);
  }
  .maintainer-dark ::v-deep .v-input .v-icon {
    color: #bacbd6;
  }
  .maintainer-dark ::v-deep .v-pagination .v-pagination__item,
  .maintainer-dark ::v-deep .v-pagination .v-pagination__navigation {
    background-color: var(--maintainer-surface-raised);
    color: var(--maintainer-text);
  }  
</style>