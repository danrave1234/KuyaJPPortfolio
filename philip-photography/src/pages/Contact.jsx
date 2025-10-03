export default function Contact() {
  return (
    <main className="container-responsive py-12">
      <h2 className="text-2xl sm:text-4xl font-semibold mb-6">Contact</h2>
      <form className="grid gap-4 max-w-xl">
        <input className="card p-3" placeholder="Name"/>
        <input className="card p-3" placeholder="Email" type="email"/>
        <textarea className="card p-3 min-h-32" placeholder="Message"/>
        <button className="btn w-fit">Send</button>
      </form>
    </main>
  )
}


