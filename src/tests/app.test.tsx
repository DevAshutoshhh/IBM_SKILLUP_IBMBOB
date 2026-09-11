import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { AppStateProvider } from '../hooks/useAppState';
import { STORAGE_KEY } from '../utils/storage';
import { OPPORTUNITIES } from '../data/opportunities';

function renderApp() {
  return {
    user: userEvent.setup(),
    ...render(
      <AppStateProvider>
        <App />
      </AppStateProvider>,
    ),
  };
}

/** The landing page deliberately repeats its call to action at the top and
 *  the bottom of the page; a student may click either one. */
async function startProfile(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('button', { name: /find my opportunities/i })[0]);
}

function storedState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

describe('the landing page', () => {
  it('leads with the promise the product actually makes', () => {
    renderApp();
    expect(
      screen.getByRole('heading', { name: 'Turn eligibility confusion into a clear action plan', level: 1 }),
    ).toBeInTheDocument();
  });

  it('states plainly that this is a prototype with demonstration data', () => {
    renderApp();
    expect(screen.getByText(/this is a prototype/i)).toBeInTheDocument();
    expect(screen.getByText(/All scheme entries are demonstration data\./i)).toBeInTheDocument();
  });

  it('offers both a skip link and a main landmark for keyboard users', () => {
    renderApp();
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

describe('the language toggle', () => {
  it('switches the whole interface to Hindi and remembers the choice', async () => {
    const { user } = renderApp();

    await user.click(screen.getAllByRole('button', { name: 'हिंदी' })[0]);

    expect(
      screen.getByRole('heading', { name: 'पात्रता की उलझन को स्पष्ट कार्य योजना में बदलें', level: 1 }),
    ).toBeInTheDocument();
    expect(storedState().language).toBe('hi');
    expect(document.documentElement.lang).toBe('hi-IN');
  });
});

describe('the profile wizard', () => {
  it('refuses to advance without the one answer the step requires, and says why', async () => {
    const { user } = renderApp();

    await startProfile(user);
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/one answer still needed/i);
    expect(screen.getByRole('heading', { name: 'Your studies', level: 2 })).toBeInTheDocument();
  });

  it('advances once an answer is given and persists it immediately', async () => {
    const { user } = renderApp();

    await startProfile(user);
    await user.click(screen.getByRole('radio', { name: 'Undergraduate degree' }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(screen.getByRole('heading', { name: 'Where you study', level: 2 })).toBeInTheDocument();
    expect(storedState().profile.educationLevel).toBe('undergraduate');
  });

  it('shows progress through the five steps', async () => {
    const { user } = renderApp();
    await startProfile(user);

    expect(screen.getByRole('progressbar', { name: /step 1 of 5/i })).toBeInTheDocument();
  });
});

describe('the opportunities page', () => {
  async function completeMinimumProfile(user: ReturnType<typeof userEvent.setup>) {
    await startProfile(user);
    await user.click(screen.getByRole('radio', { name: 'Undergraduate degree' }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    await user.selectOptions(screen.getByLabelText(/which state or union territory/i), 'MH');
    await user.click(screen.getByRole('button', { name: /^next$/i }));
  }

  it('asks for a profile before showing any matches', async () => {
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: /^opportunities$/i }));

    expect(screen.getByRole('heading', { name: /answer a few questions first/i })).toBeInTheDocument();
  });

  it('ranks every demonstration opportunity once a profile exists', async () => {
    const { user } = renderApp();
    await completeMinimumProfile(user);
    await user.click(screen.getByRole('button', { name: /^opportunities$/i }));

    expect(
      screen.getByText(`Showing ${OPPORTUNITIES.length} of ${OPPORTUNITIES.length} demonstration opportunities`),
    ).toBeInTheDocument();
  });

  it('filters by search text and offers a way back from an empty result', async () => {
    const { user } = renderApp();
    await completeMinimumProfile(user);
    await user.click(screen.getByRole('button', { name: /^opportunities$/i }));

    await user.type(screen.getByLabelText(/search opportunities/i), 'no such scheme exists');

    expect(await screen.findByRole('heading', { name: /no opportunities match these filters/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset all filters/i }));
    expect(screen.queryByRole('heading', { name: /no opportunities match these filters/i })).not.toBeInTheDocument();
  });

  it('saves a bookmark to localStorage', async () => {
    const { user } = renderApp();
    await completeMinimumProfile(user);
    await user.click(screen.getByRole('button', { name: /^opportunities$/i }));

    const [firstBookmark] = screen.getAllByRole('button', { name: /save this opportunity/i });
    await user.click(firstBookmark);

    expect(storedState().bookmarks).toHaveLength(1);
  });

  it('explains a match on demand rather than only showing a percentage', async () => {
    const { user } = renderApp();
    await completeMinimumProfile(user);
    await user.click(screen.getByRole('button', { name: /^opportunities$/i }));

    const [firstExplain] = screen.getAllByRole('button', { name: /why this match\?/i });
    await user.click(firstExplain);

    expect(screen.getAllByText(/confirmed matching reasons/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/not an official eligibility decision/i).length).toBeGreaterThan(0);
  });
});

describe('the document readiness centre', () => {
  it('records a document status and reflects it in the readiness score', async () => {
    const { user } = renderApp();

    await startProfile(user);
    await user.click(screen.getByRole('radio', { name: 'Undergraduate degree' }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    await user.selectOptions(screen.getByLabelText(/which state or union territory/i), 'MH');
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    await user.click(screen.getByRole('button', { name: /^opportunities$/i }));

    const [prepare] = screen.getAllByRole('button', { name: /prepare this application/i });
    await user.click(prepare);

    expect(screen.getByRole('heading', { name: /document readiness centre/i })).toBeInTheDocument();
    expect(screen.getByText(/never asks you to upload a document/i)).toBeInTheDocument();

    const [firstReady] = screen.getAllByRole('radio', { name: 'Ready' });
    await user.click(firstReady);

    const stored = storedState();
    const checklists = Object.values(stored.checklists)[0] as Record<string, string>;
    expect(Object.values(checklists)).toContain('ready');
  });
});

describe('the privacy panel', () => {
  it('lists what is stored and deletes all of it on confirmation', async () => {
    const { user } = renderApp();

    await startProfile(user);
    await user.click(screen.getByRole('radio', { name: 'Undergraduate degree' }));
    expect(storedState().profile.educationLevel).toBe('undergraduate');

    await user.click(screen.getAllByRole('button', { name: /^privacy$/i })[0]);

    const dialog = await screen.findByRole('dialog', { name: /your data and your privacy/i });
    expect(within(dialog).getByText(/localStorage on this device only/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /delete all my data/i }));
    await user.click(within(dialog).getByRole('button', { name: /yes, delete everything/i }));

    expect(within(dialog).getByText(/all stored data has been deleted/i)).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('can be dismissed with the Escape key', async () => {
    const { user } = renderApp();
    await user.click(screen.getAllByRole('button', { name: /^privacy$/i })[0]);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
