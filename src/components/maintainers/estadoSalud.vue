<template>
  <v-container fluid :class="{ 'maintainer-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="toolbar">
        <v-btn
          class  = "toolbar-btn-new" 
          color  = "primary"
          dark
          @click = "newItem"
        >
          NUEVO ESTADO SALUD
        </v-btn>                
        <v-spacer></v-spacer>
<!--  Filtros de busqueda -->                
        <v-text-field
          v-model       = "search""
          label         = "Buscar estado salud en el listado"
          hint          = "Escriba su criterio de búsqueda y presione 'ENTER'"
          :class        = "['toolbar-search', $vuetify.breakpoint.mdAndUp ? 'pt-6' : 'mt-4']"
          @click:append = "lookFor"
          @change       = "lookFor"                    
          outlined
          dense
        />
        <v-spacer></v-spacer>                 
<!--  Cantidad de items por paginas -->                 
        <v-select
          v-model = "items"
          :items  = "itemsPerPage"
          label   = "Cantidad de items por página"
          :class  = "['toolbar-items', $vuetify.breakpoint.mdAndUp ? 'pt-6' : 'mt-4']"
          outlined
          dense
        />                
      </v-card-title>                    
<!-- Lista de estados de salud -->
      <v-container fluid>
        <v-data-table
          class        = "tabla"        
          :headers     = "headers"
          :loading     = "isLoading"
          loading-text = "Cargando... por favor espere"
          :items       = "estadosSalud"
          disable-pagination
          hide-default-footer
        >
<!--
    Acciones
        - Editar 
        - Eliminar
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
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn 
                    class  = "accion-btn accion-btn--delete"
                    icon 
                    v-on   = "on" 
                    @click = "confirmDeleteItem(item)"
                  >                                
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Eliminar</span>
              </v-tooltip>
            </div>
          </template>                      
<!--  Mensaje cuando no hay data -->                    
          <template v-slot:no-data>
            No se han encontrado estados de salud registrados en el sistema
          </template>                           
        </v-data-table> 
<!--  Paginación -->
        <v-row class="text-center" dense>
          <v-col cols="12">
            <v-pagination
              v-model        = "page"
              :length        = "this.pages"
              :total-visible = "items"
              :disabled      = "isLoading || pages == 1"
            />
            <br />
          </v-col>
        </v-row>       
      </v-container>  
    </v-card>      
<!--
  👉 healthStatusDialog
      • Componente que permite crear un nuevo estado de salud o actualizar sus antecedentes
-->                             
    <v-dialog
      v-model    = "healthStatusDialog"
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
                      <p class="panel-title mb-1">Estado de salud</p>
                      <p class="panel-subtitle mb-0">Ingrese una descripción con un formato claro y ordenado.</p>
                    </div>
                    <v-row class="panel-fields-row" dense>
                      <v-col cols="12">
                        <v-textarea
                          v-model = "editedItem.descripcion"
                          label   = "Descripción"
                          density = "compact"
                          rows    = "1"
                          counter
                          maxlength = "50"                                        
                          :rules  = "[validRequiredRule]"
                          auto-grow
                          outlined
                          clearable                                               
                          prepend-inner-icon = "mdi-text"
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
            @click = "healthStatusDialog = false"
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
<!-- 
  👉 confirmDeleteDialog
      • Componente que despliega mensaje que confirma y cancela la eliminación del estado de salud seleccionado
-->
    <v-dialog 
      v-model    = "confirmDeleteDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
    >
      <v-card :class="{ 'maintainer-dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="white--text">
            Eliminar
          </span>
          <v-spacer />
          <v-btn dark icon @click="confirmDeleteDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" class="pt-10">
              <v-alert
                type   = "error"
                prominent
                border = "left"
                outlined
              >
                Está a punto de eliminar el estado de salud {{`Id: ${editedItem.id} (  ${editedItem.descripcion} )`}}, ¿desea continuar?.
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color  = "secondary"
            outlined
            @click = "confirmDeleteDialog = false"
          >
            No, Cancelar
          </v-btn>
          <v-btn
            color  = "primary"
            @click = "deleteItem"
          >
            Si, Eliminar
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
    name       : "estadoSalud",   
    props      : {},
    components : {},
    data       : () => ({   
      search              : '',        
      oldSearch           : '',            
      page                : 1,
      oldPage             : 1,
      items               : 5,
      healthStatusDialog  : false,
      confirmDeleteDialog : false,
      editedIndex         : -1,
      validForm           : false,  
      buttonClicked       : false,
      editedItem          : {
        id          : null,
        descripcion : null,
      },
      defaultItem         : {
        id          : null,
        descripcion : null,
      },                                                         
      headers             : [
        { text: "Id"         , value: "id"         , groupable: false, sortable: false },
        { text: "Descripción", value: "descripcion", groupable: false, sortable: false },      
        { text: "Acciones"   , value: "acciones"   , groupable: false, sortable: false },  
      ],
      itemsPerPage        : [ 5, 10, 25, 50 ],                                
    }), 
    async beforeMount() {
      await this.getData()
    },                            
    computed   : {
      ...mapGetters("estadoSaludStore", [ "estadosSalud", "pages", "isLoading" ]),                                                                    
      formTitle () {
        return { title: this.editedIndex === -1 ? 'Nuevo Tipo de Estado de Salud' : 'Editar Tipo de Estado de Salud', subtitle: this.editedIndex === -1 ? '' : `Id: ${this.editedItem.id}` }
      },
    },
    watch      : {
/*
      • page  : Observa el cambio de página y obtiene la data correspondiente
      • items : Observa el cambio de cantidad de items por página y obtiene la data correspondiente
*/      
      page: {
        deep: true,
        async handler() {
          if (this.page != this.oldPage) {
            await this.getData();
            this.oldPage = this.page;
          }
        }
      },
      async items() {
        this.page = 1;
        await this.getData()
      } 
    },                                 
    methods    : {
/*
      • getData                   : Obtiene la data de los estados de salud desde el store
      • newItem                   : Abre el dialog para crear un nuevo estado de salud
      • editItem                  : Abre el dialog para editar un estado de salud existente
      • confirmDeleteItem         : Abre el dialog de confirmación para eliminar un estado de salud
      • deleteItem                : Elimina un estado de salud
      • save                      : Guarda los cambios realizados en un estado de salud
      • closeHealthStatusDialog   : Cierra el dialog de creación/edición de estado de salud
      • closeConfirmDeleteDialog  : Cierra el dialog de confirmación de eliminación
      • validate                  : Valida el formulario de creación/edición de estado de salud
      • resetValidation           : Resetea la validación del formulario
      • validRequiredRule          : Regla de validación para campos requeridos
      • lookFor                    : Busca estados de salud según el criterio de búsqueda ingresado
*/			
      async getData() {
        await this.getListMantencionEstadoSalud({
          page                : this.page,
          items               : this.items,
          search              : this.search,
        })                            
      },            

      async newItem() {
        this.resetValidation();                            
        this.editedIndex           = -1;                                                        
        this.editedItem            = Object.assign({}, this.defaultItem);                                                        
        this.healthStatusDialog = true
      },

      async editItem (item) {
        this.resetValidation();
        this.editedIndex           = this.estadosSalud.indexOf(item);
        this.editedItem            = Object.assign({}, item);
        this.healthStatusDialog = true;
      },   

      confirmDeleteItem(item) {
        this.editedIndex         = item.id;
        this.editedItem          = Object.assign({}, item);
        this.confirmDeleteDialog = true;
      },

      async deleteItem() {
        const res = await this.deleteMantencionEstadoSalud(this.editedItem)
        if (res.status == 200) {
          toastr.success("Se ha eliminado la información correctamente", "Éxito!");
          this.page = 1
          await this.getData()
        }	else {
          toastr.error("error", "Ha ocurrido un error", "Error!");
          return;
        }
        this.closeConfirmDeleteDialog(); 
      },

      async save () {
        this.validate();
        if ( this.validForm ) {
          this.buttonClicked = true
          if (this.editedIndex > -1) {
            await this.putMantencionEstadoSalud({
              id          : this.editedItem.id,
              descripcion : this.editedItem.descripcion,
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
          } else {
            await this.postMantencionEstadoSalud({
              descripcion : this.editedItem.descripcion,
            })
            .then(async resp => {
              if (resp.status == 200) {
                toastr.success("Se ha creado correctamente el estado de salud", "Éxito!");
                this.page = 1
                await this.getData()
              } else {
                if (resp.status == 409) {
                  toastr.error(resp.message, "Error!: "+error);
                  return;
                } else if (resp.status == 401) {
                  toastr.error( resp.message, "Error!: "+error);
                  return;
                } else {
                  toastr.error( `Error distinto  ${resp.status} no manejado por el sistema, por favor comuníquese con un administrador`, "Error!");
                  return;
                }
              }
            });
          }
          this.closeHealthStatusDialog();
        }
      },     

      async closeHealthStatusDialog() {
        this.healthStatusDialog = false    
        this.editedItem            = Object.assign({}, this.defaultItem);
        this.editedIndex           = -1;     
        this.resetValidation()
        setTimeout(() =>{ this.buttonClicked = false; }, 3000)
      },                                                

      async closeConfirmDeleteDialog() {
        this.confirmDeleteDialog = false    
        this.editedItem          = Object.assign({}, this.defaultItem);
      },                                                  

      validate() {
        this.$refs.form.validate();
      },

      resetValidation(){
        if ( this.$refs.form ) this.$refs.form.resetValidation();
      },

      validRequiredRule(value) {
        return value  ? true : 'Este campo es requerido'
      },

      async lookFor(){
        if ( this.search != this.oldSearch ) {
          await this.getData();
          this.oldSearch = this.search;
          this.page      = 1;
        }
      },          

      ...mapActions("estadoSaludStore", [ "getListMantencionEstadoSalud", "postMantencionEstadoSalud"   ,
                                          "putMantencionEstadoSalud"    ,	"deleteMantencionEstadoSalud" , ]),
    }                     
  }
</script>
<style scoped>
  /* Barra de herramientas*/
  .toolbar {
    padding: 10px 2px 12px;
    align-items: flex-start;
    gap: 10px;
    border-bottom: 1px solid #d8e4f0;
  }
  .toolbar ::v-deep .v-spacer {
    max-width: 10px;
    flex: 0 0 10px;
  }
  .toolbar ::v-deep .toolbar-btn-new {
    border-radius: 10px;
    border: 1px solid transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    font-size: 0.76rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: none;
    transition: all 0.18s ease;
  }
  .toolbar ::v-deep .toolbar-btn-new:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  }
  .toolbar ::v-deep .toolbar-search {
    max-width: 430px;
    min-width: 330px;
  }
  .toolbar ::v-deep .toolbar-items {
    max-width: 250px;
    min-width: 220px;
  }
  .toolbar ::v-deep .toolbar-search .v-input__slot,
  .toolbar ::v-deep .toolbar-items .v-input__slot {
    border-radius: 10px !important;
  }
  .toolbar ::v-deep .toolbar-search.v-input--is-focused .v-input__slot,
  .toolbar ::v-deep .toolbar-items.v-input--is-focused .v-input__slot {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
  }
  .toolbar ::v-deep .toolbar-search .v-label,
  .toolbar ::v-deep .toolbar-items .v-label,
  .toolbar ::v-deep .toolbar-search input,
  .toolbar ::v-deep .toolbar-items input,
  .toolbar ::v-deep .toolbar-items .v-select__selection {
    font-size: 0.95rem;
    font-weight: 400;
    letter-spacing: 0.015em;
  }
  .toolbar ::v-deep .toolbar-search .v-input__append-inner .v-icon,
  .toolbar ::v-deep .toolbar-items .v-input__append-inner .v-icon {
    font-size: 16px;
    opacity: 0.86;
  }
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