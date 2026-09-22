"use client";

import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
type GraphRow = {
  patient_id: string;
  consultation_id: string;
  consultation_date: string;
  symptom_id: number;
  symptom: string;
  disease_id: number;
  disease: string;
  matching_symptoms: number;
};

export default function KnowledgeGraphPage() {
  const [rows, setRows] = useState<GraphRow[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(
    null
  );
  const [selectedConsultation, setSelectedConsultation] = useState<
    string | null
  >(null);
  const [selectedSymptom, setSelectedSymptom] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load graph data
   */
  useEffect(() => {
    async function loadGraph() {
      try {
        const response = await fetch(
  "/api/team/knowledge-graph",
  {
    cache: "no-store",
  }
);

        if (!response.ok) {
          throw new Error("Failed to load knowledge graph");
        }

        const data = await response.json();

        const normalized: GraphRow[] = Array.isArray(data)
          ? data
          : [data];

        setRows(normalized);

        /*
         * Automatically select the newest day.
         */
        if (normalized.length > 0) {
          const latest = normalized
            .map((row) => row.consultation_date.substring(0, 10))
            .sort()
            .at(-1);

          if (latest) {
            setSelectedDate(latest);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Knowledge graph could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadGraph();
  }, []);

  /*
   * Available dates
   */
  const availableDates = useMemo(() => {
    return Array.from(
      new Set(
        rows.map((row) =>
          row.consultation_date.substring(0, 10)
        )
      )
    ).sort((a, b) => b.localeCompare(a));
  }, [rows]);

  /*
   * Data for selected day
   */
  const dayRows = useMemo(() => {
    if (!selectedDate) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.consultation_date.substring(0, 10) ===
        selectedDate
    );
  }, [rows, selectedDate]);

  /*
   * Patients for selected day
   */
  const patients = useMemo(() => {
    return Array.from(
      new Set(dayRows.map((row) => row.patient_id))
    );
  }, [dayRows]);

  /*
   * Consultations
   *
   * If a patient is selected, only that patient's
   * consultations are shown.
   */
  const consultations = useMemo(() => {
    const filtered = selectedPatient
      ? dayRows.filter(
          (row) => row.patient_id === selectedPatient
        )
      : dayRows;

    return Array.from(
      new Map(
        filtered.map((row) => [
          row.consultation_id,
          row,
        ])
      ).values()
    );
  }, [dayRows, selectedPatient]);

  /*
   * Symptoms
   *
   * Only show symptoms belonging to the selected
   * consultation.
   */
  const symptoms = useMemo(() => {
    if (!selectedConsultation) {
      return [];
    }

    const consultationRows = dayRows.filter(
      (row) =>
        row.consultation_id === selectedConsultation
    );

    return Array.from(
      new Map(
        consultationRows.map((row) => [
          row.symptom_id,
          {
            id: row.symptom_id,
            name: row.symptom,
          },
        ])
      ).values()
    );
  }, [dayRows, selectedConsultation]);

  /*
   * Diseases
   *
   * First limit diseases to the selected consultation.
   *
   * If a symptom is selected, only diseases connected
   * to that symptom are shown.
   */
  const diseases = useMemo(() => {
    if (!selectedConsultation) {
      return [];
    }

    let consultationRows = dayRows.filter(
      (row) =>
        row.consultation_id === selectedConsultation
    );

    if (selectedSymptom !== null) {
      consultationRows = consultationRows.filter(
        (row) =>
          row.symptom_id === selectedSymptom
      );
    }

    return Array.from(
      new Map(
        consultationRows.map((row) => [
          row.disease_id,
          {
            id: row.disease_id,
            name: row.disease,
            matchingSymptoms: row.matching_symptoms,
          },
        ])
      ).values()
    );
  }, [
    dayRows,
    selectedConsultation,
    selectedSymptom,
  ]);

  /*
   * Select patient
   */
  function handlePatientSelect(patientId: string) {
    if (selectedPatient === patientId) {
      setSelectedPatient(null);
      setSelectedConsultation(null);
      setSelectedSymptom(null);
      return;
    }

    setSelectedPatient(patientId);
    setSelectedConsultation(null);
    setSelectedSymptom(null);
  }

  /*
   * Select consultation
   */
  function handleConsultationSelect(
    consultationId: string
  ) {
    if (
      selectedConsultation === consultationId
    ) {
      setSelectedConsultation(null);
      setSelectedSymptom(null);
      return;
    }

    setSelectedConsultation(consultationId);
    setSelectedSymptom(null);
  }

  /*
   * Select symptom
   */
  function handleSymptomSelect(
    symptomId: number
  ) {
    if (selectedSymptom === symptomId) {
      setSelectedSymptom(null);
      return;
    }

    setSelectedSymptom(symptomId);
  }

  /*
   * Changing the date resets all selections.
   */
  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedPatient(null);
    setSelectedConsultation(null);
    setSelectedSymptom(null);
  }

  /*
   * Clear everything except date.
   */
  function clearSelection() {
    setSelectedPatient(null);
    setSelectedConsultation(null);
    setSelectedSymptom(null);
  }

  function formatDate(date: string) {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-sm text-slate-500">
            Loading knowledge graph...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
    <div>
      <div className="text-lg font-bold text-slate-900">
        PTalk
      </div>

      <div className="text-xs text-slate-400">
        Medical Team
      </div>
    </div>

    <LogoutButton />
  </div>
</header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* Back */}
        <a
          href="/team"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to dashboard
        </a>

        {/* Heading */}
        <section className="mt-6">
          <p className="text-sm text-slate-500">
            Medical knowledge graph
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Knowledge Graph
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Select a patient, consultation, and symptom
            to explore the related clinical data.
          </p>
        </section>

        {/* Date filter */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Consultation day
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Select a day to limit the amount of graph
                data.
              </p>
            </div>

            <div className="w-full md:w-72">
              <label
                htmlFor="date"
                className="mb-2 block text-xs font-medium text-slate-500"
              >
                Date
              </label>

              <select
                id="date"
                value={selectedDate}
                onChange={(event) =>
                  handleDateChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              >
                {availableDates.map((date) => (
                  <option
                    key={date}
                    value={date}
                  >
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Selection status */}
        <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">
              Selected:
            </span>

            {selectedPatient ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                Patient
              </span>
            ) : (
              <span className="text-slate-400">
                Patient
              </span>
            )}

            <span className="text-slate-300">
              →
            </span>

            {selectedConsultation ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                Consultation
              </span>
            ) : (
              <span className="text-slate-400">
                Consultation
              </span>
            )}

            <span className="text-slate-300">
              →
            </span>

            {selectedSymptom !== null ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                Symptom
              </span>
            ) : (
              <span className="text-slate-400">
                Symptom
              </span>
            )}
          </div>

          {(selectedPatient ||
            selectedConsultation ||
            selectedSymptom !== null) && (
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear selection
            </button>
          )}
        </section>

        {/* Graph */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-sm text-slate-500">
              Interactive graph
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Patient → Consultation → Symptom → Disease
            </h2>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[1000px] grid-cols-4 gap-4">
              {/* PATIENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    1. Patients
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {patients.length} patient
                    {patients.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="max-h-[520px] space-y-2 overflow-y-auto p-3">
                  {patients.length === 0 ? (
                    <p className="p-3 text-sm text-slate-400">
                      No patients.
                    </p>
                  ) : (
                    patients.map((patient) => {
                      const selected =
                        selectedPatient === patient;

                      return (
                        <button
                          key={patient}
                          type="button"
                          onClick={() =>
                            handlePatientSelect(
                              patient
                            )
                          }
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          <p className="break-all font-mono text-xs">
                            {patient}
                          </p>

                          {selected && (
                            <p className="mt-2 text-xs text-slate-300">
                              Selected
                            </p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CONSULTATIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    2. Consultations
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {consultations.length} consultation
                    {consultations.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="max-h-[520px] space-y-2 overflow-y-auto p-3">
                  {!selectedPatient ? (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        Select a patient
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Consultations will appear here
                        after selecting a patient.
                      </p>
                    </div>
                  ) : consultations.length === 0 ? (
                    <p className="p-3 text-sm text-slate-400">
                      No consultations.
                    </p>
                  ) : (
                    consultations.map(
                      (consultation) => {
                        const selected =
                          selectedConsultation ===
                          consultation.consultation_id;

                        return (
                          <button
                            key={
                              consultation.consultation_id
                            }
                            type="button"
                            onClick={() =>
                              handleConsultationSelect(
                                consultation.consultation_id
                              )
                            }
                            className={`w-full rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <p className="font-medium">
                              {formatTime(
                                consultation.consultation_date
                              )}
                            </p>

                            <p
                              className={`mt-1 break-all font-mono text-xs ${
                                selected
                                  ? "text-slate-300"
                                  : "text-slate-400"
                              }`}
                            >
                              {
                                consultation.consultation_id
                              }
                            </p>
                          </button>
                        );
                      }
                    )
                  )}
                </div>
              </div>

              {/* SYMPTOMS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    3. Symptoms
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {symptoms.length} symptom
                    {symptoms.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="max-h-[520px] space-y-2 overflow-y-auto p-3">
                  {!selectedConsultation ? (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        Select a consultation
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Symptoms will appear here after
                        selecting a consultation.
                      </p>
                    </div>
                  ) : symptoms.length === 0 ? (
                    <p className="p-3 text-sm text-slate-400">
                      No symptoms.
                    </p>
                  ) : (
                    symptoms.map((symptom) => {
                      const selected =
                        selectedSymptom === symptom.id;

                      return (
                        <button
                          key={symptom.id}
                          type="button"
                          onClick={() =>
                            handleSymptomSelect(
                              symptom.id
                            )
                          }
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          <p className="font-medium">
                            {symptom.name}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              selected
                                ? "text-slate-300"
                                : "text-slate-400"
                            }`}
                          >
                            Symptom ID: {symptom.id}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* DISEASES */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    4. Diseases
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {diseases.length} disease
                    {diseases.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="max-h-[520px] space-y-2 overflow-y-auto p-3">
                  {!selectedConsultation ? (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        Select a consultation
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Disease matches will appear here
                        after selecting a consultation.
                      </p>
                    </div>
                  ) : diseases.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        No disease matches
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        No diseases are connected to
                        the current selection.
                      </p>
                    </div>
                  ) : (
                    diseases.map((disease) => (
                      <div
                        key={disease.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="font-medium text-slate-900">
                          {disease.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {disease.matchingSymptoms}{" "}
                          matching symptoms
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current selection */}
        {selectedConsultation && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Current graph path
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700">
                Patient
              </span>

              <span className="text-slate-300">
                →
              </span>

              <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700">
                Consultation
              </span>

              <span className="text-slate-300">
                →
              </span>

              {selectedSymptom !== null ? (
                <>
                  <span className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white">
                    {
                      symptoms.find(
                        (symptom) =>
                          symptom.id ===
                          selectedSymptom
                      )?.name
                    }
                  </span>

                  <span className="text-slate-300">
                    →
                  </span>

                  <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700">
                    {diseases.length} related disease
                    {diseases.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </>
              ) : (
                <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-700">
                  All symptoms & diseases
                </span>
              )}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Clinical interpretation
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Disease matches shown here are derived from
            the underlying symptom-matching dataset. They
            should not be interpreted as confirmed
            diagnoses.
          </p>
        </section>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl justify-around px-4 py-3">
          <a
            href="/team"
            className="flex flex-col items-center text-xs text-slate-500"
          >
            <span className="text-lg">▤</span>
            Patients
          </a>

          <a
            href="/team/knowledge-graph"
            className="flex flex-col items-center text-xs text-slate-900"
          >
            <span className="text-lg">◇</span>
            Knowledge Graph
          </a>
        </div>
      </nav>
    </main>
  );
}