import React, {Fragment, useState, useRef} from 'react';
import {Random} from 'meteor/random';
import CheckIcon from '@heroicons/react/solid/CheckIcon';
import MailIcon from '@heroicons/react/solid/MailIcon'
import {Dialog, Transition} from '@headlessui/react'
import UserIconOutline from '@heroicons/react/outline/UserIcon'
import UserAddIconOutline from '@heroicons/react/outline/UserAddIcon'
import CheckIconOutline from '@heroicons/react/outline/CheckIcon'
import CheckCircleIcon from '@heroicons/react/outline/CheckCircleIcon'
import XIcon from '@heroicons/react/solid/XIcon'
import {useTracker} from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import {Accounts} from "meteor/accounts-base";
import {methodCall} from "../infra/methodCall";

const Notification = ({notification}) => {
  const [show, setShow] = useState(true)

  const {title, message} = notification || {};
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
      >
        <div
          className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400"
                                     aria-hidden="true"/>
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    {message &&
                    <p className="mt-1 text-sm text-gray-500">{message}</p>}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        setShow(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}

const Send = ({onClose, words, setNotification, onSend}) => {
  const user = useTracker(() => Meteor.user());
  const [signUp, setSignUp] = useState(true);
  const [open, setOpen] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setErrorMessage] = useState('');

  const setError = (errorMessage) => {
    setErrorMessage(errorMessage);
    setTimeout(() => setErrorMessage(''), 5000)
  }


  const cancelButtonRef = useRef(null);
  const close = () => {
    setOpen(false);
    onClose();
  }
  const createUser = () => {
    if (!email || !password || !name) {
      setError('Please fill all the fields above.');
      return;
    }
    Accounts.createUser(
      {
        username: email,
        email,
        password,
        profile: {name}
      },
      error => {
        if (error) {
          console.error(`Error creating user ${email}`, error);
          if (error.reason) {
            setError(error.reason.replace('Username', 'Email'));
            return;
          }
          setError('Unknown error creating your user.');
          return;
        }

        console.log(`${email} created`);
      }
    );
  };

  const loginUser = () => {
    if (!email || !password) {
      setError('Please fill your email and password.');
      return;
    }
    Meteor.loginWithPassword(
      email,
      password,
      error => {
        if (!error) {
          console.log(`User authenticated ${email}`);
          return;
        }

        if (error.error === 403) {
          console.warn(`User not found`, error);
          setError(error.reason);
          return;
        }

        setError(error.reason);
        console.error(`Error authenticating user ${email}`, error);
      }
    );
  };

  const logoutUser = () => {
    Meteor.logout(() => console.log(`User logged out ${email}`));
  };

  const send = () => {

    if (!email || !name) {
      setError(`Please fill your friend's name and email.`);
      return;
    }

    methodCall('sendSequence', {words, friend: {name, email}}).then(() => {
      setNotification({
        title: 'Successfully sent!',
        message: 'Your friend will receive the sequence shortly.'
      });
      onSend();
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      close();
    }).catch(() => setError('Unknown error sending the sequence to your friend.'))
  }

  const confirm = () => {
    setError('')
    if (user) {
      send();
      return;

    }

    if (signUp) {
      createUser();
      return;
    }

    loginUser();

  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        open={open}
        onClose={close}
      >
        <div
          className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div
                  className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  {user ? <CheckIconOutline className="h-6 w-6 text-green-600"
                                            aria-hidden="true"/> : signUp ?
                    <UserAddIconOutline className="h-6 w-6 text-green-600"
                                        aria-hidden="true"/> :
                    <UserIconOutline className="h-6 w-6 text-green-600"
                                     aria-hidden="true"/>}
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3"
                                className="text-lg leading-6 font-medium text-gray-900">
                    {user ? 'Choose your friend' : signUp ? 'Sign up' : 'Sign in'}
                  </Dialog.Title>
                  {user && <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Inform your friend email so we can send the sequence to
                      him/her.
                    </p>
                  </div>}
                </div>

                <div
                  className="ml-14 mr-14">
                  <form
                    className="space-y-1.5">

                    {(user || signUp) && <div
                      className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="name"
                             className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Name
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <input
                          value={name}
                          onChange={({target: {value}}) => setName(value)}
                          type="text"
                          name="name"
                          id="name"
                          autoComplete="given-name"
                          className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>}
                    <div
                      className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="email"
                             className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Email
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <input
                          value={email}
                          onChange={({target: {value}}) => setEmail(value)}
                          type="email"
                          name="email"
                          id="email"
                          autoComplete="email"
                          className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    {!user && <div
                      className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                      <label htmlFor="password"
                             className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                        Password
                      </label>
                      <div className="mt-1 sm:mt-0 sm:col-span-2">
                        <input
                          value={password}
                          onChange={({target: {value}}) => setPassword(value)}
                          type="password"
                          name="password"
                          id="password"
                          autoComplete="password"
                          className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>}
                  </form>

                  {!user && <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {signUp &&
                      <a className="cursor-pointer text-indigo-600"
                         onClick={() => setSignUp(false)}>I already have an
                        account.</a>}
                      {!signUp &&
                      <a className="cursor-pointer  text-indigo-600"
                         onClick={() => setSignUp(true)}>I want to sign
                        up.</a>}
                    </p>
                  </div>}

                  {user && <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Sending as {user.profile.name}.{' '}
                      <a className="cursor-pointer text-indigo-600"
                         onClick={logoutUser}>Log out</a>
                    </p>
                  </div>}

                  {error &&
                  <div className="mt-2 text-center bg-red-100 rounded-lg p-2">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>}
                </div>
              </div>
              <div
                className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={confirm}
                >
                  {user ? 'Send' : signUp ? 'Sign Up' : 'Sign In'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={close}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export const Word =
  {
    AQUICO: {
      value: 'AQUICO',
      label: 'Aquico',
      color: 'indigo-500',
      hoverColor: 'indigo-900',
      letter: '∀'
    },
    AMIGO: {
      value: 'AMIGO',
      label: 'Amigo',
      color: 'green-500',
      hoverColor: 'green-900',
      letter: 'A'
    },
  };

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
};

const Words = (
  {
    words, onRemove
  }
) => {
  return (
    <nav aria-label="Progress">
      <ol className="overflow-hidden">
        {words.map((word, idx) => {

          const wordEnum = Word[word.value];
          return (
            <li key={word.key}
                className={classNames(idx !== words.length - 1 ? 'pb-10' : '', 'relative')}>
              {word.status === 'complete' ? (
                <>
                  {idx !== words.length - 1 ? (
                    <div
                      className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-indigo-600"
                      aria-hidden="true"/>
                  ) : null}
                  <a onClick={onRemove(word.key)}
                     className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span
                        className="relative z-10 w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full group-hover:bg-indigo-800">
                        <CheckIcon className="w-5 h-5 text-white"
                                   aria-hidden="true"/>
                      </span>
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col">
                      <span
                        className={`text-xs font-semibold tracking-wide uppercase text-${wordEnum.color}`}>{wordEnum.label}</span>
                      <span
                        className="text-sm text-gray-500">{idx + 1}</span>
                    </span>
                  </a>
                </>
              ) : word.status === 'current' ? (
                <>
                  {idx !== words.length - 1 ? (
                    <div
                      className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300"
                      aria-hidden="true"/>
                  ) : null}
                  <a onClick={onRemove(word.key)}
                     className="relative flex items-start group"
                     aria-current="step">
                    <span className="h-9 flex items-center" aria-hidden="true">
                      <span
                        className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full">
                        <span
                          className="h-2.5 w-2.5 bg-indigo-600 rounded-full"/>
                      </span>
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col">
                      <span
                        className={`text-xs font-semibold tracking-wide uppercase text-${wordEnum.color}`}>{wordEnum.label}</span>
                      <span
                        className="text-sm text-gray-500">{idx + 1}</span>
                    </span>
                  </a>
                </>
              ) : (
                <>
                  {idx !== words.length - 1 ? (
                    <div
                      className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300"
                      aria-hidden="true"/>
                  ) : null}
                  <a onClick={onRemove(word.key)}
                     className="relative flex items-start group">
                    <span className="h-9 flex items-center" aria-hidden="true">
                      <span
                        className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                        <span
                          className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"/>
                      </span>
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col">
                      <span
                        className={`text-xs font-semibold tracking-wide uppercase text-${wordEnum.color}`}>{wordEnum.label}</span>
                      <span
                        className="text-sm text-gray-500">{idx + 1}</span>
                    </span>
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  )
}
export const Game = () => {
    const [notification, setNotification] = useState(null)
    const [words, setWords] = useState([]);
    const [showSend, setShowSend] = useState(false);
    const onAdd = (word) => () => {
      setWords([...words.map(word => ({
        ...word,
        status: 'complete'
      })), {key: Random.id(), value: word, status: 'current'}]);
    }
    const onRemove = (key) => () => {
      setWords(words.filter(({key: currentKey}) => key !== currentKey));
    }
    const onSend = () => {
      setWords([]);
    }
    return (
      <div className="bg-gray-50 pt-12 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Create your sequence
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              You can choose as many words as you want but if that is your first
              time we recommend starting with one.
            </p>
          </div>
        </div>
        <div className="mt-10 bg-white sm:pb-16">
          <div className="relative">
            <div className="absolute inset-0 h-1/2 bg-gray-50"/>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <dl
                  className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-2">
                  <div
                    onClick={onAdd(Word.AQUICO.value)}
                    className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r  cursor-pointer">
                    <dt
                      className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">{Word.AQUICO.letter}
                    </dt>
                    <dd
                      className={`order-1 text-5xl font-extrabold text-${Word.AQUICO.color} hover:text-${Word.AQUICO.hoverColor}`}>{Word.AQUICO.label}
                    </dd>
                  </div>
                  <div
                    onClick={onAdd(Word.AMIGO.value)}
                    className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l  cursor-pointer">
                    <dt
                      className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">{Word.AMIGO.letter}
                    </dt>
                    <dd
                      className={`order-1 text-5xl font-extrabold text-${Word.AMIGO.color} hover:text-${Word.AMIGO.hoverColor}`}>{Word.AMIGO.label}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pb-10 flex  justify-center">
          {!words.length && <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Select the first word above.
          </p>}
          <Words words={words} onRemove={onRemove}/>

        </div>
        <div className="pb-10 flex  justify-center">
          <button
            onClick={() => setShowSend(true)}
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={!words.length}
          >
            Send Sequence
            <MailIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true"/>
          </button>
        </div>
        {showSend &&
        <Send onClose={() => setShowSend(false)} setNotification={setNotification} onSend={onSend}
              words={words}/>}
        {notification && <Notification notification={notification}/>}
      </div>
    );
  }
;
