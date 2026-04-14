"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { GameServer } from "@prisma/client";

export default function ServerList({ initialServers }: { initialServers: GameServer[] }) {
  const [servers, setServers] = useState<GameServer[]>(initialServers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerImage, setNewServerImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm("Are you sure you want to delete this server? This action cannot be undone.")) return;
    
    setDeletingId(serverId);
    try {
      const res = await fetch(`/api/servers/${serverId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setServers(servers.filter(s => s.id !== serverId));
      } else {
        alert("Failed to delete server");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting server");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newServerName, image: newServerImage }),
      });

      if (res.ok) {
        const createdServer = await res.json();
        setServers([createdServer, ...servers]);
        setIsModalOpen(false);
        setNewServerName("");
        setNewServerImage("");
      } else {
        alert("Failed to create server");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Server
        </button>
      </div>

      {servers.length === 0 ? (
        <div className="text-center rounded-lg border-2 border-dashed border-gray-700 p-12">
          <h3 className="mt-2 text-sm font-semibold text-white">No game servers</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new server.</p>
        </div>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <li key={server.id} className="col-span-1 divide-y divide-gray-700 rounded-lg bg-gray-800 shadow">
              <div className="flex w-full items-center justify-between space-x-6 p-6">
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="truncate text-sm font-medium text-white">{server.name}</h3>
                    <span
                      className={`inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        server.status === "RUNNING"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-red-50 text-red-700 ring-red-600/20"
                      }`}
                    >
                      {server.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-400">{server.image}</p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    disabled={deletingId === server.id}
                    className="inline-flex items-center rounded-md bg-red-600/10 px-2.5 py-1.5 text-sm font-semibold text-red-500 shadow-sm hover:bg-red-600/20"
                  >
                    {deletingId === server.id ? "Deleting..." : <TrashIcon className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-gray-700">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">
                      Create New Game Server
                    </h3>
                    <div className="mt-2 text-left">
                      <form onSubmit={handleCreateServer}>
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-300">
                            Server Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={newServerName}
                            onChange={(e) => setNewServerName(e.target.value)}
                            className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            placeholder="My Minecraft Server"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-300">
                            Docker Image
                          </label>
                          <input
                            type="text"
                            id="image"
                            required
                            value={newServerImage}
                            onChange={(e) => setNewServerImage(e.target.value)}
                            className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            placeholder="itzg/minecraft-server"
                          />
                          <p className="mt-2 text-sm text-gray-400">
                            Enter a public Docker image name (e.g., from Docker Hub).
                          </p>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                          >
                            {isSubmitting ? "Saving..." : "Save Server"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
