import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <SiteFrame>
      <main className="mt-8 max-w-2xl">
        <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          A planning aid, not a financial product.
        </h1>
        <p className="mt-3 text-base text-muted">
          Faithful Household shows one month in a biblical order: giving first, then
          what is owed, then a reserve, then living on what remains. It is meant to be used with
          Scripture open, alongside prayer, the local church, and counsel you already trust.
        </p>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-ink">What this site is for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-ink">
            <li>Put this month’s take-home into an order you can see.</li>
            <li>Receive one next step, with a passage, instead of a pile of advice.</li>
            <li>Mark three intentions yourself. The site does not decide them.</li>
            <li>Enter a filename and save. Open that file later and it loads back onto the plan.</li>
            <li>Print the month and keep the paper.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-ink">What this site is not</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-ink">
            <li>Not financial, tax, or investment advice.</li>
            <li>Not a bank connection, a full budget, or a place that holds your accounts.</li>
            <li>Not a substitute for pastoral counsel or a qualified professional.</li>
            <li>
              Entered numbers stay on your device. They are not uploaded to the website. Do not put
              account numbers, full names, or anything that identifies a person in the saved file.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-ink">Where the numbers live</h2>
          <p className="mt-3 text-base text-ink">
            The plan in this browser is kept in local storage on this device. We do not receive it.
            Clearing site data, or opening another browser, removes that local copy. A saved file is
            the copy you can move. Opening it loads the amounts back onto this form.
          </p>
        </section>

        <section id="install" className="mt-8 scroll-mt-8">
          <h2 className="font-display text-2xl text-ink">Add it to your home screen</h2>
          <p className="mt-3 text-base text-muted">
            No app store. The site itself can sit on your phone, and later versions open the same
            way.
          </p>
          <h3 className="mt-4 text-base font-medium text-ink">Android, in Chrome</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-base text-ink">
            <li>Open Faithful Household in Chrome.</li>
            <li>Tap the menu, the three dots at the top.</li>
            <li>Tap Install app, or Add to Home screen.</li>
            <li>Confirm. It opens from the icon like any other app.</li>
          </ol>
          <h3 className="mt-4 text-base font-medium text-ink">iPhone, in Safari</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-base text-ink">
            <li>Open Faithful Household in Safari.</li>
            <li>Tap the Share button.</li>
            <li>Tap Add to Home Screen, then Add.</li>
          </ol>
        </section>

        <section className="mt-8 border-t border-line pt-6">
          <h2 className="font-display text-2xl text-ink">This version, and later</h2>
          <p className="mt-3 text-base text-ink">
            This is the first version: one month, numbers you type, one next step. A longer list of
            goals, categories, and a wiser recommendation can be added without changing the order.
            Saved files from this version will still open.
          </p>
        </section>
      </main>
    </SiteFrame>
  );
}
