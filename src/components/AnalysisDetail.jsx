import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const StateColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-emerald-500",
  error: "bg-red-500",
};

const StateLabels = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  error: "Error",
};

export default function AnalysisDetail({ analysis, open, onClose }) {
  if (!analysis) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-2xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-base font-semibold text-gray-900">
                      Detalle del Análisis
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-rose-300"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Cerrar panel</span>
                        <XMarkIcon className="size-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="pb-6">
                    <div className="h-14 sm:h-12 lg:h-18" />
                    <div className="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                      <div>
                        <div className="-m-1 flex">
                          <div className="inline-flex overflow-hidden rounded-lg border-4 border-white">
                            <img
                              alt=""
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                analysis.patient?.username
                              )}&background=d3858f&size=256`}
                              className="size-24 shrink-0 sm:size-40 lg:size-48"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 sm:ml-6 sm:flex-1">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                              {analysis.patient?.username}
                            </h3>
                            <span
                              className={`ml-2.5 inline-block size-2 shrink-0 rounded-full ${
                                StateColors[analysis.state]
                              }`}
                            >
                              <span className="sr-only">
                                {StateLabels[analysis.state]}
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {analysis.patient?.email}
                          </p>
                        </div>
                        <div className="mt-5 flex flex-wrap space-y-3 sm:space-y-0 sm:space-x-3">
                          <button
                            type="button"
                            className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-rose-400 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 sm:flex-1"
                          >
                            Ver Resultados
                          </button>
                          <button
                            type="button"
                            className="inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                          >
                            Descargar PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-0 sm:py-0">
                    <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                      <div className="sm:flex sm:px-6 sm:py-5">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">
                          ID
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                          {analysis.documentId}
                        </dd>
                      </div>
                      <div className="sm:flex sm:px-6 sm:py-5">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">
                          Tipo
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                          {analysis.type === "skin"
                            ? "Análisis de Piel"
                            : analysis.type}
                        </dd>
                      </div>
                      <div className="sm:flex sm:px-6 sm:py-5">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">
                          Estado
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                          {StateLabels[analysis.state]}
                        </dd>
                      </div>
                      <div className="sm:flex sm:px-6 sm:py-5">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">
                          Fecha
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                          {format(new Date(analysis.createdAt), "PPp", {
                            locale: es,
                          })}
                        </dd>
                      </div>
                      <div className="sm:flex sm:px-6 sm:py-5">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">
                          Información del Paciente
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                          <div>
                            <p>{analysis.patient?.username}</p>
                            <p className="text-gray-500">
                              {analysis.patient?.email}
                            </p>
                            <p>{analysis.patient?.phone}</p>
                            <p>DNI: {analysis.patient?.documentValue}</p>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
