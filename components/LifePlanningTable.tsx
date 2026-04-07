export default function LifePlanningTable() {
  const tableData = [
    { year: 1965, age: 10, location: '', education: '', professional: '', financial: '', family: '', others: 'Learn cycling & Swimming' },
    { year: 1966, age: 11, location: '', education: '', professional: 'Apply for Science Tallent', financial: '', family: '', others: 'Individual Sport Tennis, Golf, Badminton, Billiards' },
    { year: 1967, age: 12, location: '', education: '', professional: 'Join NCC', financial: '', family: '', others: 'Team Sport' },
    { year: 1968, age: 13, location: '', education: '', professional: '', financial: 'Open Bank Savings Account', family: '', others: 'Debate & Essay Competition' },
    { year: 1969, age: 14, location: '', education: 'SSC', professional: 'Do Part time Job', financial: 'Learn Banking, FD, Draft', family: '', others: 'Do Social Work' },
    { year: 1970, age: 15, location: '', education: '', professional: 'Apply for NDA', financial: '', family: '', others: 'Run 10 Miles Marathon' },
    { year: 1971, age: 16, location: '', education: 'HSC', professional: 'NCC Republic Day Parade', financial: '', family: '', others: 'Run Full Marathon' },
    { year: 1972, age: 17, location: '', education: '', professional: '', financial: 'Learn Stock Market', family: '', others: 'Rock Climbing' },
    { year: 1973, age: 18, location: '', education: '', professional: '', financial: '', family: '', others: 'Do 5 Launches in Glider' },
    { year: 1974, age: 19, location: 'NDA', education: 'B Sc', professional: 'NCC C Certificate', financial: '', family: '', others: 'Learn how to book Air Tickets' },
    { year: 1975, age: 20, location: '', education: 'BE', professional: '', financial: '', family: '', others: '' },
    { year: 1976, age: 21, location: 'NDA Pass', education: 'MBA1', professional: '', financial: '', family: '', others: 'Do Power Flying' },
    { year: 1977, age: 22, location: 'IMA Pass', education: 'MBA2', professional: '', financial: '', family: '', others: '' },
    { year: 1978, age: 23, location: 'Jhansi, Cmdo Belgaum', education: '', professional: 'JOB 1', financial: 'Start Tithe', family: '', others: '' },
    { year: 1979, age: 24, location: 'YO, Deolali, OPTC Pune', education: 'PUBLIC SPEAKING COURSE', professional: '', financial: 'ULIP STARTS, Term Insurance', family: '', others: '' },
    { year: 1980, age: 25, location: '', education: '', professional: '', financial: 'BUY M/CYCLE', family: 'MARRIAGE', others: '' },
    { year: 1981, age: 26, location: '', education: 'IIM(A) MID LEADERSHIP', professional: '', financial: 'Apply for Housing Loan', family: '', others: 'Start Yearly Holiday Scheme' },
    { year: 1982, age: 27, location: '', education: '', professional: '', financial: 'BUY HOUSE 1', family: 'Train Wife to be Independent', others: '' },
    { year: 1983, age: 28, location: '', education: '', professional: 'JOB 2', financial: '', family: 'CHILD 1', others: '' },
    { year: 1984, age: 29, location: '', education: 'NEGOTIATION SKILLS COURSE', professional: '', financial: '', family: '', others: "Start support one orphan's Education" },
    { year: 1985, age: 30, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 1986, age: 31, location: '', education: 'PERSONALITY DEVELOPMENT COURSE', professional: '', financial: '', family: 'CHILD 2', others: '' },
    { year: 1987, age: 32, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 1988, age: 33, location: '', education: "Do Entrepreneur's Course", professional: '', financial: '', family: '', others: '' },
    { year: 1989, age: 34, location: '', education: '', professional: 'GM LEVEL', financial: 'BUY HOUSE 2', family: '', others: '' },
    { year: 1990, age: 35, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 1991, age: 36, location: '', education: '', professional: '', financial: 'START COMPANY', family: '', others: '' },
    { year: 1992, age: 37, location: '', education: 'IIM(A) Strategy Course', professional: '', financial: '', family: 'Make Child 1 LIFE PLANNER', others: '' },
    { year: 1993, age: 38, location: '', education: '', professional: 'VP LEVEL', financial: '', family: '', others: '' },
    { year: 1994, age: 39, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 1995, age: 40, location: '', education: '', professional: '', financial: '', family: 'Make Child 2 LIFE PLANNER', others: '' },
    { year: 1996, age: 41, location: '', education: 'Start Ph.D', professional: '', financial: '', family: 'CHILD 1 SSC', others: '' },
    { year: 1997, age: 42, location: '', education: '', professional: 'CEO', financial: 'BUY HOUSE 3', family: '', others: '' },
    { year: 1998, age: 43, location: '', education: '', professional: '', financial: '', family: 'CHILD 1 HSC', others: '' },
    { year: 1999, age: 44, location: '', education: '', professional: '', financial: '', family: 'CHILD 2 SSC', others: '' },
    { year: 2000, age: 45, location: '', education: 'Finish Ph.D', professional: '', financial: '', family: '', others: '' },
    { year: 2001, age: 46, location: '', education: '', professional: '', financial: '', family: 'CHILD 1 B Sc / CHILD 2 HSC', others: '' },
    { year: 2002, age: 47, location: '', education: '', professional: 'Start own company', financial: '', family: 'CHILD 1 BE', others: '' },
    { year: 2003, age: 48, location: '', education: '', professional: '', financial: '', family: 'CHILD 1 MBA1', others: '' },
    { year: 2004, age: 49, location: '', education: '', professional: '', financial: '', family: 'CHILD 1 MBA2 / CHILD 2 B Sc', others: '' },
    { year: 2005, age: 50, location: '', education: '', professional: '', financial: '', family: 'CHILD 2 BE', others: '' },
    { year: 2006, age: 51, location: '', education: '', professional: '', financial: '', family: 'CHILD 2 MBA1', others: '' },
    { year: 2007, age: 52, location: '', education: '', professional: '', financial: '', family: 'CHILD 1 MARRIAGE / CHILD 2 MBA2', others: '' },
    { year: 2008, age: 53, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2009, age: 54, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2010, age: 55, location: '', education: '', professional: '', financial: '', family: 'CHILD 2 MARRIAGE', others: '' },
    { year: 2011, age: 56, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2012, age: 57, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2013, age: 58, location: '', education: 'Take Company Public', professional: '', financial: 'RETIREMENT', family: '', others: '' },
    { year: 2014, age: 59, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2015, age: 60, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2016, age: 61, location: '', education: '', professional: '', financial: '', family: '', others: 'Go on world tour with Family' },
    { year: 2017, age: 62, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2018, age: 63, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2019, age: 64, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2020, age: 65, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2021, age: 66, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2022, age: 67, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2023, age: 68, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2024, age: 69, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2025, age: 70, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2026, age: 71, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2027, age: 72, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2028, age: 73, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2029, age: 74, location: '', education: '', professional: '', financial: '', family: '', others: '' },
    { year: 2030, age: 75, location: '', education: '', professional: '', financial: '', family: '', others: '' },
  ]

  return (
    <div className="mt-8 w-full overflow-x-auto rounded-lg border border-gray-300 bg-white p-3">
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-red-600">Life Planning Timeline Using a MENTOR (Sample)</h3>
        <p className="text-sm text-gray-700">A comprehensive year-by-year roadmap for life planning across multiple dimensions</p>
      </div>
      <table className="min-w-full border-collapse border border-gray-400 text-sm text-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-3 py-2 font-semibold text-left">Year</th>
            <th className="border border-gray-400 px-3 py-2 font-semibold text-left">(Age)</th>
            <th className="border border-gray-400 px-3 py-2 font-semibold text-left min-w-[120px]">Location</th>
            <th className="border border-gray-300 px-3 py-2 font-semibold text-left min-w-[180px]">Education</th>
            <th className="border border-gray-300 px-3 py-2 font-semibold text-left min-w-[150px]">Professional</th>
            <th className="border border-gray-300 px-3 py-2 font-semibold text-left min-w-[180px]">Financial</th>
            <th className="border border-gray-300 px-3 py-2 font-semibold text-left min-w-[200px]">Family</th>
            <th className="border border-gray-300 px-3 py-2 font-semibold text-left min-w-[250px]">Others</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={row.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-400 px-3 py-2 font-medium">{row.year}</td>
              <td className="border border-gray-400 px-3 py-2">({row.age})</td>
              <td className="border border-gray-400 px-3 py-2">{row.location}</td>
              <td className="border border-gray-300 px-3 py-2">{row.education}</td>
              <td className="border border-gray-300 px-3 py-2">{row.professional}</td>
              <td className="border border-gray-300 px-3 py-2">{row.financial}</td>
              <td className="border border-gray-300 px-3 py-2">{row.family}</td>
              <td className="border border-gray-300 px-3 py-2">{row.others}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
