import React from "react";

export default function Game() {
  return (
    <div className="flex flex-col h-screen bg-green-900 text-white font-sans">

      <div className="flex items-center justify-between p-4 bg-green-800">
        <h1 className="text-3xl font-bold">MyBridge</h1>
        <div className="text-3xl cursor-pointer">☰</div>
      </div>

      <div className="flex flex-1">
        <div className="relative flex flex-col items-center justify-center flex-1 bg-green-700 border-4 border-yellow-500 rounded-lg p-4 mx-4">

          <div className="absolute top-4 text-center">
            <div className="bg-blue-600 text-white px-2 py-1 rounded">Alex</div>
            <div className="flex space-x-1 mt-2">

              {[...Array(13)].map((_, i) => (
                <div key={i} className="bg-white text-black w-6 h-10 rounded border border-gray-400"></div>
              ))}
            </div>
          </div>

          <div className="absolute left-4 flex flex-col items-center">
            <div className="bg-blue-600 text-white px-2 py-1 rounded">Lisa</div>
            <div className="flex flex-col space-y-1 mt-2">

              {[...Array(13)].map((_, i) => (
                <div key={i} className="bg-white text-black w-10 h-6 rounded border border-gray-400"></div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 text-center">
            <div className="bg-blue-600 text-white px-2 py-1 rounded">John</div>
            <div className="flex space-x-1 mt-2">

              {[...Array(13)].map((_, i) => (
                <div key={i} className="bg-white text-black w-6 h-10 rounded border border-gray-400"></div>
              ))}
            </div>
          </div>

          <div className="absolute right-4 flex flex-col items-center">
            <div className="bg-blue-600 text-white px-2 py-1 rounded">Marie</div>
            <div className="flex flex-col space-y-1 mt-2">

              {[...Array(13)].map((_, i) => (
                <div key={i} className="bg-white text-black w-10 h-6 rounded border border-gray-400"></div>
              ))}
            </div>
          </div>

          <div className="bg-green-600 p-4 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
  
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white text-black w-10 h-14 rounded border border-gray-400 flex items-center justify-center">
                  ♣️
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/4 bg-gray-100 text-gray-900 rounded-lg shadow-lg p-4">
          <div className="bg-yellow-500 text-center text-xl font-bold py-2 rounded mb-4">Round 1</div>

          <div className="mb-4">
            <div className="bg-red-500 text-white text-center py-1 rounded-t">Team Alex & John</div>
            <div className="bg-blue-500 text-white text-center py-1 rounded-b mb-2">Team Lisa & Marie</div>
            <div className="flex justify-around">
              <div className="text-2xl font-semibold text-red-600">0</div>
              <div className="text-2xl font-semibold text-blue-600">0</div>
            </div>
          </div>

          <div className="bg-green-500 text-white text-center py-2 rounded-lg mb-4">
            Trump Card
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-white text-black w-16 h-24 rounded border border-gray-400 flex items-center justify-center text-3xl">
              ♥️
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button className="bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">Place Card</button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-2 bg-green-800 text-gray-300 text-sm">
        <span>© 2024 MyBridge Copyright</span>
        <span className="cursor-pointer hover:text-white">Terms and Services</span>
      </div>
    </div>
  );
}
