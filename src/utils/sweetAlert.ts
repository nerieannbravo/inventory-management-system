import Swal from 'sweetalert2';
import "@/styles/popup.css";

//-------------------- GENERAL ALERTS -------------------//

// ----- Close Without Saving Confirmation ----- //
export const showCloseWithoutSavingConfirmation = () => {
    return Swal.fire({
        title: 'Unsaved Changes',
        html: '<p>You might have unsaved changes. Are you sure you want to close without saving?</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Close Without Saving',
        cancelButtonText: 'Go Back',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Close Without Updating Confirmation -----
export const showCloseWithoutUpdatingConfirmation = () => {
    return Swal.fire({
        title: 'Unsaved Changes',
        html: '<p>You might have unsaved changes. Are you sure you want to close without updating?</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Close Without Updating',
        cancelButtonText: 'Go Back',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- STOCK MANAGEMENT SPECIFIC -------------------//

// ----- Add Stock Confirmation ----- //
export const showStockSaveConfirmation = (count: number) => {
    const message =
        count > 1
            ? `Are you sure you want to save these ${count} items?`
            : `Are you sure you want to save this item?`;

    return Swal.fire({
        title: 'Confirm Save',
        html: `<p>${message}</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Stock Success ----- //
export const showStockSavedSuccess = (count: number) => {
    const message =
        count > 1
            ? `${count} items added successfully.`
            : `Item added successfully.`;

    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        html: `<p>${message}</p>`,
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Duplicate Item Error ----- //
export const showDuplicateItemError = () => {
    return Swal.fire({
        title: 'Duplicate Item',
        text: 'This item is already selected in another form. Please select a different item.',
        icon: 'error',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Stock Save Error ----- //
export const showStockSaveError = (errorMessage?: string) => {
    return Swal.fire({
        title: 'Error',
        html: errorMessage || 'Failed to save stock items. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Partial Success Warning ----- //
export const showPartialSuccessWarning = () => {
    return Swal.fire({
        title: 'Partial Success',
        text: 'Some items were saved successfully, but others failed. Please check the results.',
        icon: 'warning',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Stock Confirmation ----- //
export const showStockUpdateConfirmation = (item_name: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the stock details for <strong>${item_name}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Stock Success ----- //
export const showStockUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Stock details has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Remove Expired Confirmation ----- //
export const showDeleteExpiredConfirmation = () => {
    return Swal.fire({
        title: 'Remove Expired Item',
        html: `<p>Are you sure you want to delete this expired batch? You will not be able to undo this.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Remove Expired Success ----- //
export const showDeleteExpiredSuccess = () => {
    return Swal.fire({
        title: 'Deleted!',
        html: `<p>An expired item has been deleted.</p>`,
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

export const showDeleteExpiredError = (errorMessage?: string) => {
    return Swal.fire({
        title: 'Error',
        html: errorMessage || 'Deleting this batch is not allowed.',
        icon: 'error',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- REQUEST MANAGEMENT SPECIFIC -------------------//

// ----- Add Request Confirmation ----- //
export const showRequestSaveConfirmation = (count: number) => {
    const message =
        count > 1
            ? `Are you sure you want to save these ${count} item requests?`
            : `Are you sure you want to save this item request?`;

    return Swal.fire({
        title: 'Confirm Save',
        html: `<p>${message}</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Request Success ----- //
export const showRequestSavedSuccess = (count: number) => {
    const message =
        count > 1
            ? `${count} item requests added successfully.`
            : `Item request added successfully.`;

    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        html: `<p>${message}</p>`,
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Request Confirmation ----- //
export const showRequestUpdateConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the request details for <strong>${itemName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Request Success ----- //
export const showRequestUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Item request has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

export const showEditError = (status: string, customMessage?: string) => {
    return Swal.fire({
        title: 'Edit Action Denied',
        html: customMessage
            ? `<p>${customMessage}</p>`
            : `<p>This request cannot be edited because it has already been marked as <strong>${status}</strong>.</p>`,
        icon: 'error',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Request Save Error ----- //
export const showRequestSaveError = (errorMessage?: string) => {
    return Swal.fire({
        title: 'Error',
        html: errorMessage || 'Failed to save requests. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};


//-------------------- ORDER MANAGEMENT SPECIFIC -------------------//

// ----- Add Order Confirmation ----- //
export const showOrderSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this order request?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Order Success ----- //
export const showOrderSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Order added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Order Confirmation ----- //
export const showOrderUpdateConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the order details for <strong>${itemName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Order Success ----- //
export const showOrderUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Order detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- BUS MANAGEMENT SPECIFIC -------------------//

// ----- Add Bus Confirmation ----- //
export const showBusSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this bus details?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Bus Success ----- //
export const showBusSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Bus added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Bus Save Error ----- //
export const showBusSaveError = (errorMessage?: string) => {
    return Swal.fire({
        title: 'Error',
        html: errorMessage || 'Failed to save bus. Please try again.',
        icon: 'error',
        confirmButtonText: 'Okay',
        background: 'white',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus Confirmation ----- //
export const showBusUpdateConfirmation = (bodyNumber: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the bus details for <strong>${bodyNumber}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus Success ----- //
export const showBusUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Bus detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus File Confirmation ----- //
export function showRemoveFileConfirmation(fileName?: string) {
    const text = fileName
        ? `Are you sure you want to remove "${fileName}"?`
        : `Are you sure you want to remove this file?`;

    return Swal.fire({
        title: "Remove File?",
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
}


//-------------------- BUS MAINTENANCE SPECIFIC -------------------//

// ----- Add Bus Maintenance Confirmation ----- //
export const showBusMaintenanceSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this bus maintenance details?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Bus Maintenance Success ----- //
export const showBusMaintenanceSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Bus maintenance added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus Maintenance Confirmation ----- //
export const showBusMaintenanceUpdateConfirmation = (bodyNumber: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the bus maintenance details for <strong>${bodyNumber}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus Maintenance Success ----- //
export const showBusMaintenanceUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Bus maintenance detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- BUS DISPOSAL SPECIFIC -------------------//

// ----- Add Bus Maintenance Confirmation ----- //
export const showBusDisposalSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this bus disposal details?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Bus Disposal Success ----- //
export const showBusDisposalSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Bus disposal added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus Disposal Confirmation ----- //
export const showBusDisposalUpdateConfirmation = (bodyNumber: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the bus disposal details for <strong>${bodyNumber}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Bus Disposal Success ----- //
export const showBusDisposalUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Bus disposal detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Bus Disposal Save Error ----- //
export const showBusDisposalSaveError = (errorMessage?: string) => {
    return Swal.fire({
        title: 'Error!',
        text: errorMessage || 'Failed to save bus disposal. Please try again.',
        icon: 'error',
        background: 'white',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'swal-custom-popup',
            confirmButton: 'swal-error-button'
        }
    });
};


//-------------------- STOCK MAINTENANCE SPECIFIC -------------------//

// ----- Add Stock Maintenance Confirmation ----- //
export const showStockMaintenanceSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this stock maintenance details?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Stock Maintenance Success ----- //
export const showStockMaintenanceSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Stock maintenance added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Stock Maintenance Confirmation ----- //
export const showStockMaintenanceUpdateConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the stock maintenance details for <strong>${itemName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Stock Maintenance Success ----- //
export const showStockMaintenanceUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Stock maintenance detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- STOCK DISPOSAL SPECIFIC -------------------//

// ----- Add Stock Maintenance Confirmation ----- //
export const showStockDisposalSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this stock disposal details?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Stock Disposal Success ----- //
export const showStockDisposalSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Stock disposal added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Stock Disposal Confirmation ----- //
export const showStockDisposalUpdateConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the stock disposal details for <strong>${itemName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Stock Disposal Success ----- //
export const showStockDisposalUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Stock disposal detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- ITEM MANAGEMENT SPECIFIC -------------------//

// ----- Add Item Confirmation ----- //
export const showItemSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this item?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Item Success ----- //
export const showItemSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Item added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Item Confirmation ----- //
export const showItemUpdateConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the details for <strong>${itemName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Item Success ----- //
export const showItemUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Item detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Remove Linked Supplier Confirmation ----- //
export const showDeleteLinkedSupplierConfirmation = () => {
    return Swal.fire({
        title: 'Remove Linked Supplier',
        html: `<p>Are you sure you want to delete this linked supplier? You will not be able to undo this.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Remove Linked Supplier Success ----- //
export const showDeleteLinkedSupplierSuccess = () => {
    return Swal.fire({
        title: 'Deleted!',
        html: `<p>A linked supplier has been deleted.</p>`,
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- SUPPLIER MANAGEMENT SPECIFIC -------------------//

// ----- Add Supplier Confirmation ----- //
export const showSupplierSaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this supplier?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Supplier Success ----- //
export const showSupplierSavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Supplier added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Supplier Confirmation ----- //
export const showSupplierUpdateConfirmation = (supplierName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the details for <strong>${supplierName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Supplier Success ----- //
export const showSupplierUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Supplier detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Remove Linked Item Confirmation ----- //
export const showDeleteLinkedItemConfirmation = () => {
    return Swal.fire({
        title: 'Remove Linked Item',
        html: `<p>Are you sure you want to delete this linked item? You will not be able to undo this.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Remove Linked Item Success ----- //
export const showDeleteLinkedItemSuccess = () => {
    return Swal.fire({
        title: 'Deleted!',
        html: `<p>A linked item has been deleted.</p>`,
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

//-------------------- ITEM CATEGORY SPECIFIC -------------------//

// ----- Add Category Confirmation ----- //
export const showCategorySaveConfirmation = () => {
    return Swal.fire({
        title: 'Confirm Save',
        text: 'Are you sure you want to save this item category?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Add Category Success ----- //
export const showCategorySavedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Item category added successfully.',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Category Confirmation ----- //
export const showCategoryUpdateConfirmation = (categoryName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the details for <strong>${categoryName}</strong>?</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        background: 'white',
        reverseButtons: true,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

// ----- Edit Category Success ----- //
export const showCategoryUpdatedSuccess = () => {
    return Swal.fire({
        title: 'Updated!',
        text: 'Category detail has been updated.',
        icon: 'success',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};