# SafeSteps

SafeSteps is a mobile website that helps people learn about emergencies, prepare for them, and respond quickly when one happens.

## Language

**Emergency Mode**:
The step-by-step, one-instruction-per-screen walkthrough for a live emergency, entered from the "I need help now" card. In the UI it is labelled "I need help now"; `emergency` in code.
_Avoid_: Panic mode, quick guide

**Picker**:
The "What is happening?" screen where a person chooses which emergency they face, shown as picture tiles with everyday labels.
_Avoid_: Emergency list, menu

**Picker label**:
A guide's everyday-language name used on the picker tile ("Bad bleeding"), separate from its guide title ("Severe Bleeding").

**Flow**:
The sequence of Emergency Mode screens for one emergency, from the first step to the What now screen.
_Avoid_: Wizard, emergencySteps (in conversation)

**Step**:
One screen in a flow. Either an **instruction** (picture, short sentence, Next) or a **yes/no question** whose answers each lead to a chosen step or the end.

**What now screen**:
The shared screen at the end of every flow, with after-care, other emergency numbers, saved-contact links, and the way into the full guide.
_Avoid_: Done screen, summary

**Prepare**:
The area where a person gets ready before an emergency: emergency plan, kit checklist, saved contacts. Same word in the UI and in code (`prepare`), matching the tagline Learn · Prepare · Respond.
_Avoid_: Get ready, preparedness section

**Learn**:
The area for reading full guides calmly, before or after an emergency.

**Guide**:
The full written content for one emergency, read in Learn.
_Avoid_: Article, lesson

**Call 1122 bar**:
The red full-width bar fixed to the bottom of every user-facing screen that dials 1122 in one tap. The only red interface element.
_Avoid_: Help button, SOS button

**Panic layout / Calm layout**:
The two screen layouts. Panic is used only in Emergency Mode (huge text, one action, no tab bar). Calm is used everywhere else.
