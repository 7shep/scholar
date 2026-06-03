import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { difficultyClass, DownloadButton, upcomingTasks } from "./shared";

export function Hero({ heroWindowY, heroAuraY }: { heroWindowY: number; heroAuraY: number }) {
  return (
    <section className="hero" id="how-it-works">
      <div className="hero__aura" aria-hidden="true" style={{ transform: `translateY(${heroAuraY}px)` }} />
      <div className="container hero__grid">
        <div>
          <p className="accent-pill">100% Free for Students</p>
          <h1>Your entire school life, organized.</h1>
          <p className="hero__subcopy">
            Ditch the sticky notes and scattered apps. Scholar syncs your assignments, calculates your grades, and
            manages your calendar, all in one free desktop app.
          </p>
          <div className="download-row" id="download">
            <DownloadButton platform="macOS" />
            <DownloadButton platform="Windows" />
          </div>
          <p className="social-proof">Join 50,000+ students organizing their semester.</p>
        </div>

        <div className="mock-window" style={{ transform: `translateY(${heroWindowY}px)` }}>
          <div className="window-bar">
            <span />
            <span />
            <span />
            <div className="window-title">Scholar - Dashboard</div>
          </div>
          <div className="window-body">
            <aside className="window-sidebar">
              <h4>Scholar</h4>
              <p>Fall Semester</p>
              <ul>
                <li className="is-active">Dashboard</li>
                <li>Assignments</li>
                <li>Grades</li>
                <li>Calendar</li>
                <li>Calculator</li>
              </ul>
            </aside>
            <section className="window-content">
              <div className="window-content__header">
                <h3>Up Next</h3>
                <span className="gpa">GPA: 3.8</span>
              </div>
              {upcomingTasks.map((task) => (
                <article key={task.title} className="task-card">
                  {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  <div>
                    <h4 className={task.completed ? "is-crossed" : ""}>{task.title}</h4>
                    <p>
                      <span>{task.course}</span>
                      <Clock3 size={12} />
                      <span>{task.due}</span>
                    </p>
                  </div>
                  <span className={difficultyClass(task.level)}>{task.level}</span>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
