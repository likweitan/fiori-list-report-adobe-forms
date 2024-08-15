sap.ui.define([
    "sap/m/PDFViewer",
    "sap/m/MessageToast"
], function (PDFViewer) {
    'use strict';

    return {
        getPDFData: function () {

            // get the Model reference
            var oModel = this.getView().getModel('additionalModel');
            // get billing document  from selected index
            var vSelectedBillDoc = this.getView().byId('com.project1::sap.suite.ui.generic.template.ListReport.view.ListReport::zsac_i_po_header--responsiveTable').getSelectedItem().getBindingContext().getProperty('PurchaseOrder');
            return new Promise((resolve, reject) => {
                // Perform Read operation and pass billingdoc as parameter to URL
                oModel.read("/ZCUSTOM_FORMAPI(p_billingdoc='" + vSelectedBillDoc + "')/Set",
                    {
                        success: function (oData, oResponse) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
            })

        },
        onPrintPreview: async function (oEvent) {

            var opdfViewer = new PDFViewer();
            this.getView().addDependent(opdfViewer);
            var oBusyDialog = new sap.m.BusyDialog({
                title: 'Generating Form...'
            });
            oBusyDialog.open();

            // Get the PDF data 
            var vPDF = await this.getPDFData();

            let base64EncodedPDF = vPDF.results[0].stream_data;

            let decodedPdfContent = atob(base64EncodedPDF);
            let byteArray = new Uint8Array(decodedPdfContent.length);
            for (var i = 0; i < decodedPdfContent.length; i++) {
                byteArray[i] = decodedPdfContent.charCodeAt(i);
            }
            var blob = new Blob([byteArray.buffer], {
                type: 'application/pdf'
            });
            var pdfurl = URL.createObjectURL(blob);
            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
            opdfViewer.setSource(pdfurl);
            opdfViewer.setVisible(true);

            opdfViewer.setTitle("Billing Document ");
            console.log('Reached to PDF')
            opdfViewer.open();
            oBusyDialog.close();

        }
    };
});