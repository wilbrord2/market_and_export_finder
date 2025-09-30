"use client";
import { useEffect, useState } from "react";
import { ProductType } from "./api/search/route";
import Link from "next/link";

const QuickLinks = [
  { comp: "RDB", link: "https://rdb.rw/export/" },
  { comp: "NAEB", link: "https://www.naeb.gov.rw/2" },
];

function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [countryFilter, setCountryFilter] = useState("All");

  const itemsPerPage = 10;

  const handleSearch = async (query: string) => {
    if (query.length < 1) {
      setResults([]);
      setCurrentPage(1);
    } else {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    setResults([]);
    setCountryFilter("All");
  }, [query]);

  const countries = [
    "All",
    ...new Set(results.map((r) => r.export_to).filter(Boolean)),
  ];

  let filteredResults = results;
  if (countryFilter !== "All") {
    filteredResults = results.filter(
      (item) => item.export_to === countryFilter
    );
  }

  filteredResults = [...filteredResults].sort((a, b) => {
    const priceA = Number(a.net_price);
    const priceB = Number(b.net_price);
    return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  return (
    <div className="relative flex flex-col items-center justify-center space-y-8 w-full min-h-screen bg-gray-50 px-4">
      {/* Header */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl space-y-2">
        <h1 className="text-4xl font-bold text-center text-green-800">
          Market And Export Finder
        </h1>
        <p className="text-sm text-center text-gray-600 pb-2">
          Discover companies, products, destinations, and export earnings from
          Rwanda.
        </p>

        {/* Search Box */}
        <div className="flex gap-2 pl-2 border border-gray-300 rounded-full overflow-hidden w-full shadow-sm">
          <input
            type="text"
            value={query}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(query);
              }
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product..."
            className="p-3 flex-1 outline-none focus:outline-none rounded-l-full"
          />
          <button
            onClick={() => handleSearch(query)}
            className="bg-green-600 font-bold text-white px-6 text-sm py-3 rounded-r-full hover:bg-green-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      {results.length > 0 && (
        <div className="flex gap-4 flex-wrap items-center w-full max-w-6xl">
          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-green-600 p-2 rounded shadow-sm"
          >
            {countries.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort Button */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Sort Price: {sortOrder === "asc" ? "Low → High" : "High → Low"}
          </button>
        </div>
      )}

      {/* Table */}
      {results.length > 0 && (
        <div className="overflow-x-auto w-full max-w-6xl bg-white shadow-md rounded-lg p-2">
          <table className="w-full border-collapse text-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Exporters</th>
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2 text-left">Country</th>
                <th className="border p-2 text-left">Contact</th>
                <th className="border p-2 text-center">Net Price</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border p-2">{item.company_name}</td>
                  <td className="border p-2">{item.product}</td>
                  <td className="border p-2">{item.export_to || "N/A"}</td>
                  <td className="border p-2 text-sm">
                    {item.website ? (
                      <a
                        target="_blank"
                        href={`mailto:${item.website}`}
                        className="text-green-600 hover:underline"
                      >
                        {item.website}
                      </a>
                    ) : item.product.toLocaleLowerCase() === "tea" ||
                      item.product.toLocaleLowerCase() === "coffee" ? (
                      <Link
                        target="_blank"
                        href="https://www.naeb.gov.rw/rwanda-coffee/stakeholders/coffee-exporters"
                        className="hover:underline text-green-600 text-sm"
                      >
                        Check on NAEB
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    ${Number(item.net_price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center flex-wrap gap-2 p-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border hover:bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {results.length === 0 && query.length > 0 && (
        <p className="text-gray-500 mt-4">No results found.</p>
      )}

      {/* Support Links */}
      <div className="flex items-center justify-center flex-wrap shadow p-4 rounded space-x-4 w-full max-w-fit mx-auto">
        <h1 className="text-green-700 font-bold border-r-3 pr-4 border-r-green-600">
          Support Links
        </h1>
        <div className="flex items-center flex-wrap justify-evenly gap-4 text-sm">
          {QuickLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              className="py-2 px-8 font-bold w-full border-b-3 border-b-green-600 hover:bg-green-100 rounded duration-300 transition-colors"
            >
              <span>{item.comp}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Home;
