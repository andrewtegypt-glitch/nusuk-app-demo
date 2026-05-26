// Nusuk App Demo — interactive workflow prototype
(function () {
  'use strict';

  const toggles = document.querySelectorAll('.toggle-btn');
  const views = {
    child: document.getElementById('view-child'),
    parent: document.getElementById('view-parent'),
  };

  const workflowLayer = document.getElementById('workflowLayer');
  const workflowContent = document.getElementById('workflowContent');
  const toast = document.getElementById('toast');

  let activeViewName = 'child';
  let lastFocused = null;
  let lessonStep = 0;
  let addGoalStep = 0;
  const addGoalDraft = { child: 'Layla', goal: 'School trip', amount: 800, monthly: 60 };

  const lessonData = {
    compound: {
      emoji: '🎓',
      title: 'What is compounding interest?',
      color: 'blue',
      xp: 60,
      steps: [
        {
          label: 'Story',
          title: 'Money can earn money',
          body: 'If Youssef saves $100 and earns 10%, he has $110. Next year, the whole $110 can earn more.',
          visual: '$100 → $110 → $121',
        },
        {
          label: 'Try it',
          title: 'Choose the smarter option',
          body: 'Which gives more after two years at 10%?',
          choices: ['Saving the profit separately', 'Keeping the profit invested'],
          answer: 1,
        },
        {
          label: 'Complete',
          title: 'Lesson completed',
          body: 'Youssef earns XP and unlocks a parent discussion prompt.',
          visual: '+60 XP · New badge progress',
        },
      ],
    },
    inflation: {
      emoji: '📈',
      title: 'How does inflation work?',
      color: 'green',
      xp: 50,
      steps: [
        {
          label: 'Story',
          title: 'Prices can climb over time',
          body: 'A snack that costs $2 today may cost $2.20 later. Saving needs to grow faster than prices.',
          visual: '$2.00 → $2.20',
        },
        {
          label: 'Try it',
          title: 'Spot the real value',
          body: 'If prices rise 10% and money grows 5%, what happens?',
          choices: ['Buying power falls', 'Buying power doubles'],
          answer: 0,
        },
        {
          label: 'Complete',
          title: 'Inflation mastered',
          body: 'The app turns this into a family challenge: find one price that changed this year.',
          visual: '+50 XP · Family challenge',
        },
      ],
    },
    bank: {
      emoji: '🏦',
      title: 'How banks work',
      color: 'amber',
      xp: 75,
      steps: [
        {
          label: 'Story',
          title: 'Banks keep money safe',
          body: 'A bank account can hold savings, track deposits, and sometimes pay interest.',
          visual: 'Deposit → Safe balance → Statement',
        },
        {
          label: 'Try it',
          title: 'Pick the bank job',
          body: 'Which one is a bank account good for?',
          choices: ['Hiding cash under a mattress', 'Tracking money safely'],
          answer: 1,
        },
        {
          label: 'Complete',
          title: 'Bank basics complete',
          body: 'Youssef can now ask a parent to explain the family’s linked account rules.',
          visual: '+75 XP · Ask parent prompt',
        },
      ],
    },
  };

  function activateView(viewName) {
    activeViewName = viewName;
    toggles.forEach((btn) => {
      const active = btn.dataset.view === viewName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    Object.entries(views).forEach(([name, el]) => {
      if (!el) return;
      const active = name === viewName;
      el.classList.toggle('is-active', active);
      if (active) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
    views[viewName]?.querySelector('.scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
    closeFlow(false);
  }

  function setTab(viewName, target) {
    const view = views[viewName];
    if (!view) return;
    const navBtns = view.querySelectorAll('.nav-btn');
    const panes = view.querySelectorAll('.tab-pane');
    const scroller = view.querySelector('.scroll-area');
    navBtns.forEach((b) => {
      const active = b.dataset.tab === target;
      b.classList.toggle('is-active', active);
      if (active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    panes.forEach((p) => p.classList.toggle('is-active', p.dataset.pane === target));
    scroller?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function openFlow(html) {
    lastFocused = document.activeElement;
    workflowContent.innerHTML = html;
    workflowLayer.hidden = false;
    requestAnimationFrame(() => workflowLayer.classList.add('is-open'));
    workflowContent.querySelector('button, [href], input, select, textarea')?.focus();
  }

  function closeFlow(restoreFocus = true) {
    if (!workflowLayer || workflowLayer.hidden) return;
    workflowLayer.classList.remove('is-open');
    setTimeout(() => {
      workflowLayer.hidden = true;
      workflowContent.innerHTML = '';
      if (restoreFocus && lastFocused?.focus) lastFocused.focus();
    }, 180);
  }

  function money(value) {
    return `$${Number(value).toLocaleString()}`;
  }

  function goalFromCard(card) {
    return {
      title: card.querySelector('h4')?.textContent?.trim() || 'Family goal',
      percent: card.querySelector('.goal-pct')?.textContent?.trim() || '0%',
      amount: card.querySelector('.goal-amounts')?.textContent?.replace(/\s+/g, ' ').trim() || '$0 of $0',
      emoji: card.querySelector('.goal-emoji')?.textContent?.trim() || '🎯',
      note: card.querySelector('.goal-note')?.textContent?.trim() || 'Tap contribute to model the next family action.',
    };
  }

  function renderGoalDetail(goal) {
    openFlow(`
      <header class="flow-head">
        <span class="flow-emoji">${goal.emoji}</span>
        <div>
          <p class="flow-kicker">Goal detail</p>
          <h2 id="workflowTitle">${goal.title}</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="flow-card">
        <div class="goal-top"><h4>${goal.amount}</h4><span class="goal-pct">${goal.percent}</span></div>
        <div class="progress progress--blue" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${parseInt(goal.percent, 10)}">
          <span class="progress-fill" style="width:${goal.percent}"></span>
        </div>
        <p class="flow-copy">${goal.note}</p>
      </div>
      <div class="insight-grid">
        <div><strong>$50</strong><span>Suggested next deposit</span></div>
        <div><strong>6 mo</strong><span>Faster if family joins</span></div>
      </div>
      <div class="flow-actions">
        <button class="flow-btn flow-btn--secondary" type="button" data-action="switch-parent-goals">View in parent</button>
        <button class="flow-btn" type="button" data-action="open-contribution" data-goal="${goal.title}">Contribute</button>
      </div>
    `);
  }

  function renderContribution(goalTitle = 'University fund') {
    openFlow(`
      <header class="flow-head">
        <span class="flow-emoji">💳</span>
        <div>
          <p class="flow-kicker">Parent workflow</p>
          <h2 id="workflowTitle">Add contribution</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="flow-card">
        <label class="flow-label">Goal</label>
        <div class="select-mock">${goalTitle}</div>
        <label class="flow-label">Amount</label>
        <div class="amount-row" role="group" aria-label="Contribution amount">
          <button type="button" class="amount-chip" data-amount="25">$25</button>
          <button type="button" class="amount-chip is-selected" data-amount="50">$50</button>
          <button type="button" class="amount-chip" data-amount="100">$100</button>
        </div>
        <p class="flow-copy">This shows the parent-to-child funding moment: choose amount, confirm, then the feed and goal progress respond.</p>
      </div>
      <div class="flow-actions">
        <button class="flow-btn flow-btn--secondary" type="button" data-action="close-flow">Cancel</button>
        <button class="flow-btn" type="button" data-action="confirm-contribution" data-goal="${goalTitle}">Confirm $50</button>
      </div>
    `);
  }

  function confirmContribution(goalTitle) {
    const selected = workflowContent.querySelector('.amount-chip.is-selected')?.dataset.amount || '50';
    const firstFeed = document.querySelector('[data-pane="parent-dashboard"] .feed');
    const item = document.createElement('li');
    item.className = 'feed-item feed-item--new';
    item.innerHTML = `
      <span class="feed-avatar feed-avatar--purple" aria-hidden="true">👩</span>
      <div class="feed-body">
        <p class="feed-name">Fatima (You)</p>
        <p class="feed-meta">${goalTitle.split('·')[0].trim()} · Just now</p>
      </div>
      <span class="feed-amount">+${money(selected)}</span>
    `;
    firstFeed?.prepend(item);
    closeFlow(false);
    activateView('parent');
    setTab('parent', 'parent-dashboard');
    showToast(`Contribution added: ${money(selected)} to ${goalTitle.split('·')[0].trim()}`);
  }

  function lessonKeyFromTitle(title) {
    const lower = title.toLowerCase();
    if (lower.includes('inflation')) return 'inflation';
    if (lower.includes('bank')) return 'bank';
    return 'compound';
  }

  function renderLesson(key) {
    const lesson = lessonData[key];
    const step = lesson.steps[lessonStep];
    const dots = lesson.steps.map((_, i) => `<span class="${i === lessonStep ? 'is-active' : ''}"></span>`).join('');
    const quiz = step.choices ? `
      <div class="choice-list">
        ${step.choices.map((choice, i) => `<button type="button" class="choice-btn" data-action="answer-quiz" data-correct="${i === step.answer}">${choice}</button>`).join('')}
      </div>
    ` : '';

    openFlow(`
      <header class="flow-head flow-head--${lesson.color}">
        <span class="flow-emoji">${lesson.emoji}</span>
        <div>
          <p class="flow-kicker">${step.label}</p>
          <h2 id="workflowTitle">${lesson.title}</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="lesson-player">
        <div class="lesson-dots" aria-label="Lesson progress">${dots}</div>
        <div class="lesson-visual">${step.visual || lesson.emoji}</div>
        <h3>${step.title}</h3>
        <p>${step.body}</p>
        ${quiz}
      </div>
      <div class="flow-actions">
        ${lessonStep > 0 ? '<button class="flow-btn flow-btn--secondary" type="button" data-action="lesson-back">Back</button>' : '<button class="flow-btn flow-btn--secondary" type="button" data-action="close-flow">Exit</button>'}
        <button class="flow-btn" type="button" data-action="${lessonStep === lesson.steps.length - 1 ? 'complete-lesson' : 'lesson-next'}" data-lesson="${key}">
          ${lessonStep === lesson.steps.length - 1 ? `Earn ${lesson.xp} XP` : 'Continue'}
        </button>
      </div>
    `);
  }

  function completeLesson(key) {
    const lesson = lessonData[key];
    document.querySelectorAll('.xp-points strong').forEach((node) => {
      node.textContent = (1240 + lesson.xp).toLocaleString();
    });
    const quickLearner = [...document.querySelectorAll('.badge-name')].find((node) => node.textContent.includes('Quick learner'));
    quickLearner?.closest('.badge-tile')?.classList.add('badge-tile--celebrate');
    closeFlow(false);
    showToast(`${lesson.title} complete. +${lesson.xp} XP added.`);
  }

  function renderRewardClaim() {
    openFlow(`
      <header class="flow-head flow-head--amber">
        <span class="flow-emoji">🍦</span>
        <div>
          <p class="flow-kicker">Reward workflow</p>
          <h2 id="workflowTitle">Claim family ice cream night</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="flow-card">
        <p class="flow-copy">Youssef spends 1,000 XP. Parent gets an approval request and the reward moves into the family plan.</p>
        <div class="approval-route">
          <span>Youssef requests</span><span>→</span><span>Fatima approves</span><span>→</span><span>Family calendar</span>
        </div>
      </div>
      <div class="flow-actions">
        <button class="flow-btn flow-btn--secondary" type="button" data-action="close-flow">Cancel</button>
        <button class="flow-btn" type="button" data-action="confirm-reward">Request approval</button>
      </div>
    `);
  }

  function renderAddGoal() {
    const titles = ['Who is it for?', 'What are we saving for?', 'Target and plan'];
    const body = [
      `<div class="choice-list choice-list--grid">
        ${['Youssef', 'Layla', 'Family'].map((name) => `<button type="button" class="choice-btn ${addGoalDraft.child === name ? 'is-selected' : ''}" data-action="set-draft" data-field="child" data-value="${name}">${name}</button>`).join('')}
      </div>`,
      `<div class="choice-list">
        ${['School trip', 'Quran course', 'New bicycle', 'Emergency fund'].map((goal) => `<button type="button" class="choice-btn ${addGoalDraft.goal === goal ? 'is-selected' : ''}" data-action="set-draft" data-field="goal" data-value="${goal}">${goal}</button>`).join('')}
      </div>`,
      `<div class="flow-card">
        <label class="flow-label">Target amount</label>
        <div class="amount-row">
          ${[500, 800, 1200].map((amount) => `<button type="button" class="amount-chip ${addGoalDraft.amount === amount ? 'is-selected' : ''}" data-action="set-draft-number" data-field="amount" data-value="${amount}">${money(amount)}</button>`).join('')}
        </div>
        <label class="flow-label">Monthly plan</label>
        <div class="select-mock">${money(addGoalDraft.monthly)} / month from family contributions</div>
      </div>`,
    ];
    openFlow(`
      <header class="flow-head">
        <span class="flow-emoji">🎯</span>
        <div>
          <p class="flow-kicker">Add goal · Step ${addGoalStep + 1} of 3</p>
          <h2 id="workflowTitle">${titles[addGoalStep]}</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="lesson-dots">${[0,1,2].map((_, i) => `<span class="${i === addGoalStep ? 'is-active' : ''}"></span>`).join('')}</div>
      ${body[addGoalStep]}
      <div class="flow-summary">
        <strong>Preview</strong>
        <span>${addGoalDraft.child} · ${addGoalDraft.goal} · ${money(addGoalDraft.amount)}</span>
      </div>
      <div class="flow-actions">
        ${addGoalStep > 0 ? '<button class="flow-btn flow-btn--secondary" type="button" data-action="goal-back">Back</button>' : '<button class="flow-btn flow-btn--secondary" type="button" data-action="close-flow">Cancel</button>'}
        <button class="flow-btn" type="button" data-action="${addGoalStep === 2 ? 'create-goal' : 'goal-next'}">${addGoalStep === 2 ? 'Create goal' : 'Next'}</button>
      </div>
    `);
  }

  function createGoal() {
    const lists = document.querySelectorAll('[data-pane="parent-goals"] .goal-list, [data-pane="parent-dashboard"] .goal-list');
    lists.forEach((list) => {
      const card = document.createElement('article');
      card.className = 'goal-card goal-card--new';
      card.innerHTML = `
        <div class="goal-emoji" aria-hidden="true">🧭</div>
        <div class="goal-body">
          <div class="goal-top"><h4>${addGoalDraft.goal} · ${addGoalDraft.child}</h4><span class="goal-pct">0%</span></div>
          <div class="progress progress--amber"><span class="progress-fill" style="width:0%"></span></div>
          <p class="goal-amounts"><strong>$0</strong> <span>of ${money(addGoalDraft.amount)}</span></p>
        </div>
      `;
      list.prepend(card);
    });
    const goalsSummary = document.querySelector('.summary-grid .summary-box:nth-child(2) .summary-num');
    if (goalsSummary) goalsSummary.textContent = '6';
    closeFlow(false);
    activateView('parent');
    setTab('parent', 'parent-goals');
    showToast(`New goal created for ${addGoalDraft.child}: ${addGoalDraft.goal}`);
  }

  function renderMember(member) {
    openFlow(`
      <header class="flow-head">
        <span class="flow-emoji">${member.querySelector('.family-avatar')?.textContent || '👤'}</span>
        <div>
          <p class="flow-kicker">${member.querySelector('.family-role')?.textContent || 'Family member'}</p>
          <h2 id="workflowTitle">${member.querySelector('.family-name')?.textContent || 'Family member'}</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="insight-grid insight-grid--three">
        <div><strong>${member.querySelector('.family-amount')?.textContent || '$0'}</strong><span>Total contributed</span></div>
        <div><strong>2</strong><span>Active goals</span></div>
        <div><strong>92%</strong><span>On track</span></div>
      </div>
      <div class="flow-card">
        <p class="flow-copy">This drill-down lets a parent see one person's role, contribution history, permissions, and the next useful action.</p>
      </div>
      <div class="flow-actions">
        <button class="flow-btn flow-btn--secondary" type="button" data-action="switch-parent-goals">See goals</button>
        <button class="flow-btn" type="button" data-action="open-contribution" data-goal="University fund">Add contribution</button>
      </div>
    `);
  }

  function renderNotifications() {
    openFlow(`
      <header class="flow-head">
        <span class="flow-emoji">🔔</span>
        <div>
          <p class="flow-kicker">Parent alerts</p>
          <h2 id="workflowTitle">Today’s prompts</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="flow-list">
        <button type="button" class="flow-row" data-action="open-contribution" data-goal="First laptop">💻 Youssef is $140 away from laptop goal</button>
        <button type="button" class="flow-row" data-action="switch-child-learn">🎓 Review compounding lesson with Youssef</button>
        <button type="button" class="flow-row" data-action="open-add-goal">🎯 Layla asked for a school trip goal</button>
      </div>
    `);
  }

  function renderStreak() {
    openFlow(`
      <header class="flow-head flow-head--amber">
        <span class="flow-emoji">🔥</span>
        <div>
          <p class="flow-kicker">Child engagement</p>
          <h2 id="workflowTitle">7-day streak</h2>
        </div>
        <button class="flow-close" type="button" data-action="close-flow" aria-label="Close">×</button>
      </header>
      <div class="streak-week" aria-label="Seven day streak">
        ${['S','M','T','W','T','F','S'].map((d) => `<span>${d}</span>`).join('')}
      </div>
      <div class="flow-card">
        <p class="flow-copy">Streaks reward repeated learning, saving check-ins, and parent-child money conversations.</p>
      </div>
      <div class="flow-actions">
        <button class="flow-btn" type="button" data-action="switch-child-learn">Do today’s lesson</button>
      </div>
    `);
  }

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => activateView(btn.dataset.view));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = btn.dataset.view === 'child' ? 'parent' : 'child';
        activateView(next);
        document.querySelector(`.toggle-btn[data-view="${next}"]`)?.focus();
      }
    });
  });

  document.querySelectorAll('.app-view').forEach((view) => {
    view.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => setTab(view.id.includes('child') ? 'child' : 'parent', btn.dataset.tab));
    });
  });

  document.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === 'close-flow') return closeFlow();
      if (action === 'open-contribution') return renderContribution(actionEl.dataset.goal || 'University fund');
      if (action === 'confirm-contribution') return confirmContribution(actionEl.dataset.goal || 'University fund');
      if (action === 'lesson-next') { lessonStep += 1; return renderLesson(actionEl.dataset.lesson); }
      if (action === 'lesson-back') { lessonStep -= 1; return renderLesson(Object.keys(lessonData).find((k) => lessonData[k].title === workflowContent.querySelector('h2')?.textContent) || 'compound'); }
      if (action === 'complete-lesson') return completeLesson(actionEl.dataset.lesson);
      if (action === 'answer-quiz') {
        actionEl.closest('.choice-list')?.querySelectorAll('.choice-btn').forEach((btn) => btn.classList.remove('is-selected', 'is-wrong'));
        actionEl.classList.add(actionEl.dataset.correct === 'true' ? 'is-selected' : 'is-wrong');
        showToast(actionEl.dataset.correct === 'true' ? 'Correct. Continue to finish the lesson.' : 'Try again. The app gives safe feedback.');
        return;
      }
      if (action === 'confirm-reward') {
        const claim = document.querySelector('.reward-claim');
        if (claim) {
          claim.textContent = 'Requested';
          claim.disabled = true;
        }
        closeFlow(false);
        showToast('Reward request sent to Fatima for approval.');
        return;
      }
      if (action === 'open-add-goal') { addGoalStep = 0; return renderAddGoal(); }
      if (action === 'goal-next') { addGoalStep += 1; return renderAddGoal(); }
      if (action === 'goal-back') { addGoalStep -= 1; return renderAddGoal(); }
      if (action === 'set-draft' || action === 'set-draft-number') {
        addGoalDraft[actionEl.dataset.field] = action === 'set-draft-number' ? Number(actionEl.dataset.value) : actionEl.dataset.value;
        return renderAddGoal();
      }
      if (action === 'create-goal') return createGoal();
      if (action === 'switch-parent-goals') { closeFlow(false); activateView('parent'); return setTab('parent', 'parent-goals'); }
      if (action === 'switch-child-learn') { closeFlow(false); activateView('child'); return setTab('child', 'child-learn'); }
    }

    const cta = e.target.closest('.lesson-cta');
    if (cta) {
      lessonStep = 0;
      const title = cta.closest('.lesson-card')?.querySelector('h4')?.textContent || '';
      return renderLesson(lessonKeyFromTitle(title));
    }

    const reward = e.target.closest('.reward-claim');
    if (reward && !reward.disabled) return renderRewardClaim();

    const addGoal = e.target.closest('.add-goal-btn');
    if (addGoal) {
      addGoalStep = 0;
      return renderAddGoal();
    }

    const headerIcon = e.target.closest('.header-icon');
    if (headerIcon) return renderNotifications();

    const streak = e.target.closest('.streak-badge');
    if (streak) return renderStreak();

    const sectionLink = e.target.closest('.section-link');
    if (sectionLink) {
      const text = sectionLink.textContent.toLowerCase();
      if (text.includes('see all')) return setTab('child', 'child-goals');
      if (text.includes('library')) return setTab('child', 'child-learn');
      if (text.includes('badges')) return setTab('child', 'child-rewards');
      if (text.includes('view all')) return renderNotifications();
    }

    const familyItem = e.target.closest('.family-item');
    if (familyItem) return renderMember(familyItem);

    const feedItem = e.target.closest('.feed-item');
    if (feedItem) {
      const goal = feedItem.querySelector('.feed-meta')?.textContent?.split('·')[0]?.trim() || 'Family goal';
      return renderContribution(goal);
    }

    const goalCard = e.target.closest('.goal-card');
    if (goalCard) return renderGoalDetail(goalFromCard(goalCard));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFlow();
  });
})();
