<template>
  <v-container fluid :class="{ 'boletin-dark': $vuetify.theme.dark }">
    <v-card class="elevation-0">
      <v-card-title class="toolbar" v-if="this.informes.length > 0 && message == ''">
        <v-btn 
          class  = "toolbar-btn-changeState"				
          color  = "primary"
          dark
          @click = "confirmChangeStateItem()"
        >
          ENTREGA TURNO
        </v-btn>                
        <v-spacer></v-spacer>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-chip
              v-on="on"
              class="ma-2"
              :color="'blue'"
              outlined
              @click="generatePdf"
            >
            <span class="mr-2">{{ 'Exportar a PDF' }}</span>
            <v-spacer />
            <v-icon small>{{ 'mdi-file-pdf-box' }}</v-icon>
          </v-chip>
        </template>
        <span>{{ 'Presione para exportar boletín de novedades institucionales a PDF' }}</span>
      </v-tooltip>
      <v-spacer></v-spacer>                 
    </v-card-title>   
    <v-card-subtitle v-else-if="message !== ''" class="boletin-empty-wrap">
      <div class="boletin-empty-state text-center">
        <div class="boletin-empty-icon">
          <v-icon color="white" size="30">mdi-alert-circle-outline</v-icon>
        </div>
        <h3 class="boletin-empty-title">Boletín Pendiente de Creación</h3>
        <p class="boletin-empty-message">
          {{ message }}
        </p>
        <div class="boletin-cta">
          <p class="boletin-cta-text mb-3">
            Para la creación del boletín vaya a la opción de Preliminares y publique los informes pendientes.
          </p>
          <v-btn
            class="boletin-cta-btn"
            color="primary"
            depressed
            @click="$router.push({ name: 'preliminares'})"
          >
            <v-icon left small>mdi-file-document-check-outline</v-icon>
            Ir a Preliminares
          </v-btn>
        </div>
        <div class="boletin-empty-accent"></div>
      </div>
    </v-card-subtitle>
    <v-card-subtitle v-else class="boletin-empty-wrap">
      <div class="boletin-empty-state text-center">
        <div class="boletin-empty-icon">
          <v-icon color="white" size="30">mdi-alert-circle-outline</v-icon>
        </div>
        <h3 class="boletin-empty-title">Boletín Pendiente de Publicación</h3>
        <p class="boletin-empty-message">
          Aún no tiene informes preliminares registrados en el sistema
        </p>
        <div class="boletin-empty-accent"></div>
      </div>
    </v-card-subtitle>
<!-- Lista de informes preliminares -->            
    <v-container fluid>
      <v-text-field  v-if="this.informes.length > 0" 
        class   = "font-italic"
        v-model = "subTitle"
        filled
        :background-color = "$vuetify.theme.dark ? '#303438' : '#f3f4f6'"
        density = "compact"
      /> 
      <div class="font-weight-regular"
        v-for = "(item, index) in this.informes"
      >
        <v-row dense>
          <v-col cols="auto" class="font-weight-bold">{{ index + 1 }}.</v-col>
          <v-col>
            <p class="text-decoration-underline text-uppercase font-weight-bold">{{ item.tipO_INCIDENTE.descripcion }}</p>
            <p><span class="text-decoration-underline">Fecha:</span></br>{{ getFormatDateTimeMilitary( item.fechA_HECHO ) }} </p>
            <p><span class="text-decoration-underline">Lugar:</span></br><span style="white-space: pre-line"> {{ item.lugaR_HECHO }}</span></p>
            <p><span class="text-decoration-underline">Circunstancias:</span></br><span style="white-space: pre-line">{{ item.circunstanciA_HECHO }}</span></p>
            <p><span class="text-decoration-underline">Daños al personal:</span></br><span style="white-space: pre-line">{{ item.danoS_PERSONALES }}</span></p>
            <p><span class="text-decoration-underline">Medidas adoptadas:</span></br><span style="white-space: pre-line">{{ item.medidaS_ADOPTADAS }}</span></p>                            
          </v-col>
        </v-row>
      </div>
    </v-container>
    </v-card>
<!-- 
  👉 confirmChangeStateDialog
      • Componente que despliega mensaje que confirma y cancela el cambio de estado del preliminar
-->			
    <v-dialog 
      v-model    = "confirmChangeStateDialog"
      persistent
      :max-width = "$vuetify.breakpoint.mdAndUp ? '50vw' : '80vw'"
    >
      <v-card :class="{ 'boletin-dialog--dark': $vuetify.theme.dark }">
        <v-card-title class="primary">
          <span class="white--text">
            Entregar turno
          </span>
          <v-spacer />
          <v-btn dark icon @click="confirmChangeStateDialog = false">
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
                Está a punto de realizar el cambio de turno, la Gestión de Informes Preliminares de Seguridad quedará sin antecedentes ¿desea continuar?
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color  = "secondary"
            outlined
            @click = "confirmChangeStateDialog = false"
          >
            No, Cancelar
          </v-btn>
          <v-btn
            color  = "primary"
            @click = "changeStateItem"
          >
            Si, Entregar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { mapGetters, mapActions } from "vuex"
  import toastr from 'toastr'
  import 'toastr/build/toastr.min.css'

  export default {
    name       : "boletin",        
    props      : {
    },
    components : {
    },           
    data       : () => ({
      subTitle                 : '',                                           
      confirmChangeStateDialog : false,
      message                  : '',
    }),     
    computed   : {
      ...mapGetters("informesPreliminaresStore", [ "informes", "isLoading" ]),                        
    },
    async beforeMount() {
      await this.getData()
      this.subTitle = this.getSubtitle()                                
    },
    methods    : {
      async getData() {
        await this.getGeneracionDeBoletinInstitucional()
        .then(resp => {
          if (resp.status === 404) {
            this.message= "Aún tiene informes preliminares registrados en el sistema sin publicar"
            toastr.warning(this.message, "Advertencia!");
          } 
        })
      },

      confirmChangeStateItem() {
        this.confirmChangeStateDialog = true;
      },                       

      async changeStateItem() {
        await this.putEntregaDeTurnoPME()
          .then(async resp => {
            if (resp.status == 200) {
              toastr.success("Se ha actualizado la información correctamente", "Éxito!");
              this.$router.push({ name: 'inicioPME' });
            } else {
              toastr.error("Ha ocurrido un error", "Error!");
              return;
            }
          });
          this.closeConfirmChangeStateItem();    
          return true
        },
        async closeConfirmChangeStateItem() {
          this.confirmChangeStateDialog = false    
        },                         

        getFormatDateTimeMilitary(datetime) {
          const date                     = 	new Date(datetime)
          const month                    = 	new Intl.DateTimeFormat('es-ES',{month: 'long'}).format(date).toUpperCase().substring(0,3)
          const formatedDateTimeMilitary =	date.getDate().toString().padStart(2, "0")    +
                                            date.getHours().toString().padStart(2, "0")   +
                                            date.getMinutes().toString().padStart(2, "0") +
                                            month                                         + 
                                            date.getFullYear()
          return formatedDateTimeMilitary
        },

        getSubtitle() {
          const days          = ['domingo', 'lunes', 'martes', 'miércoles','jueves','viernes','sábado']                            
          const currentDate   = new Date()
          const yesterdayDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))
          return '(Entre el ' + days[yesterdayDate.getDay()] + ' ' + this.getFormatDateTimeMilitary(yesterdayDate) + ' y el ' + days[currentDate.getDay()] + ' ' + this.getFormatDateTimeMilitary(currentDate) + ')'
        },   

        setBodyPdf () {
          let tableData = []
          let index     = 0
          for ( const item of this.informes ) {
            tableData.push([  
              [	{ text : ++index + '. ' + item.tipO_INCIDENTE.descripcion  , style : 'boldUnderline', margin  : [ 0,24, 0,0] }	],
              [	{ text : 'Fecha:'                                          , style : 'underline'    , margin  : [12,12, 0,0] },
                { text :  this.getFormatDateTimeMilitary( item.fechA_HECHO),                          margin  : [12, 6, 0,0] }	],
              [ { text : 'Lugar:'                                          , style : 'underline'    , margin  : [12,12,10,0] },
                { text : item.lugaR_HECHO                                  ,                          margin  : [12, 6, 0,0] }	],
              [	{ text : 'Circunstancias:'                                 , style : 'underline'    , margin  : [12,12,10,0] },
                { text : item.circunstanciA_HECHO                          ,                          margin  : [12, 6, 0,0] }	],
              [ { text : 'Daños al personal:'                              , style : 'underline'    , margin  : [12,12,10,0] },
                { text : item.danoS_PERSONALES                             ,                          margin  : [12, 6, 0,0] }	],
              [ { text : 'Medidas adoptadas:'                              , style : 'underline'    , margin  : [12,12,10,0] },
                { text : item.medidaS_ADOPTADAS                            ,                          margin  : [12, 6, 0,0] }	],
            ])
          }
          return tableData
        },

        generatePdf() {
          const pdfMake = require('pdfmake/build/pdfmake.js')
          if ( pdfMake.vfs == undefined ) {
            const pdfFonts = require('../../../public/fonts/vfs_fonts_times.js')
            pdfMake.vfs = pdfFonts.pdfMake.vfs
          }
          pdfMake.fonts = {
            //     Roboto : {
            //         normal      : 'Roboto-Regular.ttf',
            //         bold        : 'Roboto-Medium.ttf' ,
            //         italics     : 'Roboto-Italic.ttf' ,
            //         bolditalics : 'Roboto-Mediumtalic.ttf' ,
            // },
            TimesNewRoman  : {
              normal      : 'Times-Regular.ttf',
              bold        : 'Times-Bold.ttf' ,
              italics     : 'Times-Italic.ttf' ,
              bolditalics : 'Times-BoldItalic.ttf' ,
            }
          }
          const docDefinition = {
            pageSize    : 'A4',
            pageMargins : [40,100,40,100], // Si se requieren más elementos en header, hay que ajustar el margen superior
            defaultStyle : {
              font     : 'TimesNewRoman',
              fontSize : 14
            },
            content     : [
              {	text : 'BOLETÍN DE NOVEDADES INSTITUCIONALES', style: 'title'   , margin  : [0,40,0,0]	},                                    
              { text : this.subTitle                         , style :'subTitle', margin  : [0, 5,0,0]	},
              ...this.setBodyPdf(),
            ],
            header      : function(currentPage, pageCount, pageSize) {
              if ( currentPage == 1 ) {
                return [
                  { 
                    columns : [
                      { text   : 'EJÉRCITO DE CHILE'              , width      : '60%', alignment : 'center', margin  : [0,40,0,0],},
                      { text   : ''                               , width      : '1%',      },                                                                                
                      { text   : 'EJEMPLAR N.°__/__ HOJA N°__/__ ', width      : '39%', alignment : 'left' , margin  : [0,40,0,0] }, 
                    ],
                  },
                  {
                    columns : [
                      { text   : 'COMANDO DE OPERACIONES ESPECIALES', width      : '60%' , alignment : 'center' },
                      { text   : ''                                 , width      : '1%'                         },
                      { text   : ''                                 , width      : '39%'                        }                                                                                
                    ]
                  },
                  { 
                    columns : [
                      { text   : 'Brigada de Inteligencia'          , width      : '60%', alignment : 'center' },
                      { text   : ''                                 , width      : '1%'                        },                                                                                                                                                                
                      { text   : 'BINTE DEPTO II/b (R) N.°2437/____', width      : '39%', alignment : 'left'   }
                    ]                                                                    
                  }                                                                        
                ]
              } else {
                return [
                  { 
                    columns : [
                      { text   : ''                               , width      : '60%'                                            },
                      { text   : ''                               , width      : '1%'                                             },                                                                                   
                      { text   : 'EJEMPLAR N.°__/__ HOJA N°__/__ ', width      : '39%', alignment : 'left' , margin  : [0,40,0,0] }, 
                    ]                                                                    
                  },
                ]
              }
            },
            footer      : function (currentPage,pageCount) {
              return [
                {
                  columns : [
                    { text   : '', },
                  ]
                }                                                                          
              ]
            },
            styles      : {
              title         : {	bold       : true, decoration : 'underline',	alignment  : 'center',											},
              subTitle      : {	                                              alignment	 : 'center',	italics    : true,	},
              bold          : {	bold       : true,							                                       						        },
              underline     : {	                   decoration : 'underline',							                                },
              boldUnderline : {	bold       : true, decoration : 'underline',						            											},
            }
          }
          pdfMake.createPdf(docDefinition,null,).print()
        },

        ...mapActions("informesPreliminaresStore", ["getGeneracionDeBoletinInstitucional" , "putEntregaDeTurnoPME",	]),            
        }
    }
</script>

<style scoped>
  .boletin-empty-wrap {
    display: flex;
    justify-content: center;
    padding-top: 52px;
    padding-bottom: 20px;
  }

  .boletin-empty-state {
    position: relative;
    width: min(760px, 100%);
    padding: 32px 28px 26px;
    border: 1px solid #c8d0d8;
    border-top: 2px solid #b71c1c;
    border-radius: 20px;
    background: transparent;
    box-shadow: 0 8px 18px rgba(17, 24, 39, 0.08);
    overflow: hidden;
  }

  .boletin-empty-state::before {
    content: none;
  }

  .boletin-empty-state::after {
    content: none;
  }

  .boletin-empty-overline {
    display: inline-block;
    padding: 4px 10px;
    margin-bottom: 14px;
    border: 1px solid rgba(255, 255, 255, 0.34);
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(248, 251, 255, 0.86);
  }

  .boletin-empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    margin-bottom: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f4a261 0%, #e76f51 100%);
    box-shadow: 0 12px 24px rgba(231, 111, 81, 0.35);
  }

  .boletin-empty-title {
    margin: 0;
    font-size: clamp(1.16rem, 2vw, 1.52rem);
    line-height: 1.28;
    font-weight: 400;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    text-wrap: balance;
    color: #1f2933;
  }

  .boletin-empty-message {
    margin: 12px auto 0;
    max-width: 620px;
    font-size: clamp(0.95rem, 1.55vw, 1.02rem);
    line-height: 1.6;
    font-weight: 300;
    letter-spacing: 0.2px;
    text-wrap: pretty;
    color: #4b5563;
  }

  .boletin-cta {
    margin: 16px auto 0;
    padding: 14px 16px;
    max-width: 620px;
    border: 1px solid #dbe3ea;
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .boletin-cta-text {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.55;
    color: #334155;
  }

  .boletin-cta-btn {
    border-radius: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: none;
    box-shadow: 0 6px 16px rgba(25, 118, 210, 0.22);
  }

  .boletin-cta-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(25, 118, 210, 0.28);
  }

  .boletin-empty-accent {
    width: 94px;
    height: 3px;
    margin: 22px auto 0;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(183, 28, 28, 0.75) 0%, rgba(183, 28, 28, 0.25) 100%);
    box-shadow: none;
  }
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
  .toolbar ::v-deep .toolbar-btn-changeState {
    border-radius: 10px;
    border: 1px solid transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    font-size: 0.76rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: none;
    transition: all 0.18s ease;
  }
  .toolbar ::v-deep .toolbar-btn-changeState:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  }

  .boletin-dark ::v-deep > .v-card {
    background: #242628 !important;
    color: #d4d8dc;
  }

  .boletin-dark ::v-deep .toolbar {
    border-bottom-color: #45494d;
  }

  .boletin-dark ::v-deep .v-text-field input {
    color: #d4d8dc;
  }

  .boletin-dialog--dark {
    background: #242628 !important;
    color: #d4d8dc;
  }

  .boletin-dark .boletin-empty-state {
    border-color: #45494d;
    background: #2b2f32;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
  }

  .boletin-dark .boletin-empty-title {
    color: #e2e7eb;
  }

  .boletin-dark .boletin-empty-message {
    color: #c0c7cd;
  }

  .boletin-dark .boletin-cta {
    border-color: #51575c;
    background: linear-gradient(180deg, #34383b 0%, #2b2f32 100%);
  }

  .boletin-dark .boletin-cta-text {
    color: #d4d8dc;
  }

</style>
