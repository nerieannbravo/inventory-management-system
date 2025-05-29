import Swal from 'sweetalert2';
import "@/styles/popup.css"

//-------------------- GENERAL ALERTS -------------------//

// ----- Close Without Saving Confirmation ----- //
export const showCloseWithoutSavingConfirmation = () => {
    return Swal.fire({
        title: 'Unsaved Changes',
        html: '<p>You have unsaved changes. Are you sure you want to close without saving?</p>',
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
        html: '<p>You have unsaved changes. Are you sure you want to close without updating?</p>',
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

// ----- Edit Stock Confirmation ----- //
export const showStockUpdateConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Update',
        html: `<p>Are you sure you want to update the stock details for <strong>${itemName}</strong>?</p>`,
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
export const showStockUpdatedSuccess = (itemName: string) => {
    return Swal.fire({
        title: 'Updated!',
        text: `Stock details of ${itemName} has been updated.`,
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

// ----- Delete Stock Confirmation ----- //
export const showStockDeleteConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Deletion',
        html: `<p>Are you sure you want to delete <strong>${itemName}</strong>? You will not be able to undo this.</p>`,
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

// ----- Delete Stock Success ----- //
export const showStockDeletedSuccess = (itemName: string) => {
    return Swal.fire({
        title: 'Deleted!',
        text: `${itemName} has been deleted.`,
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
export const showRequestUpdatedSuccess = (itemName: string) => {
    return Swal.fire({
        title: 'Updated!',
        text: `Request for ${itemName} has been updated.`,
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

// ----- Delete Request Confirmation ----- //
export const showRequestDeleteConfirmation = (itemName: string) => {
    return Swal.fire({
        title: 'Confirm Deletion',
        html: `<p>Are you sure you want to delete the request for <strong>${itemName}</strong>? You will not be able to undo this.</p>`,
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

// ----- Delete Request Success ----- //
export const showRequestDeletedSuccess = (itemName: string) => {
    return Swal.fire({
        title: 'Deleted!',
        text: `Request for ${itemName} has been deleted.`,
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

//-------------------- GENERATE REPORT SPECIFIC -------------------//
export const showGenerateReportConfirmation = () => {
    return Swal.fire({
        title: 'Generate Report',
        html: '<p>Are you sure you want to generate a report with the current data?</p>',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Generate Report',
        cancelButtonText: 'Cancel',
        background: 'white',
        confirmButtonColor: '#961C1E',
        cancelButtonColor: '#ECECEC',
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

export const showReportGeneratedSuccess = () => {
    return Swal.fire({
        icon: 'success',
        title: 'Report Generated!',
        text: 'Your report has been generated successfully.',
        confirmButtonColor: '#961C1E',
        background: 'white',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};
