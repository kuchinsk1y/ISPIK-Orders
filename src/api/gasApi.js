/**
 * Wywołuje funkcję na serwerze Google Apps Script
 * @param {string} serverFunctionName - Nazwa funkcji w Code.gs
 * @param {...any} args - Argumenty do przekazania funkcji
 * @returns {Promise<any>} - Promise z danymi lub błędem
*/

export const callGasApi = (serverFunctionName, ...args) => {
  return new Promise((resolve, reject) => {
    google.script.run.withSuccessHandler((response) => {
      try {
        const data = typeof response === "string" ? JSON.parse(response) : response
        if (data && data.status === "success") resolve(data.data)
        else reject(new Error(data?.error?.message || "Niepoprawna odpowiedź z serwera"))
      } catch (e) {
        reject(new Error("Niepoprawny format odpowiedzi z serwera"))
      }
    }).withFailureHandler((error) => {
      console.error("GAS Failure Handler:", error)
      reject(error)
    })[serverFunctionName](...args)
  })
}

