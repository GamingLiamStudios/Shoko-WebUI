/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState } from 'react';
import { remove } from 'lodash';
import cx from 'classnames';
import { DropResult } from 'react-beautiful-dnd';
import { Icon } from '@mdi/react';
import { mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import DnDList from '@/components/DnDList/DnDList';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import LanguagesModal, { languageDescription } from '@/components/Dialogs/LanguagesModal';
import toast from '@/components/Toast';

import { usePostAniDBTestLoginMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { useSettingsContext } from '../SettingsPage';

const UpdateFrequencyValues = () => (
  <>
    <option value={1}>Never</option>
    <option value={2}>Every 6 Hours</option>
    <option value={3}>Every 12 Hours</option>
    <option value={4}>Every 24 Hours</option>
    <option value={5}>Once a Week</option>
    <option value={6}>Once a Month</option>
  </>
);

function AniDBSettings() {
  const { newSettings, setNewSettings, updateSetting } = useSettingsContext();

  const [testAniDbLoginTrigger, testAniDbLoginResult] = usePostAniDBTestLoginMutation();

  const [showLanguagesModal, setShowLanguagesModal] = useState<'Series' | 'Episode' | null>(null);

  const {
    Anime_UpdateFrequency, AVDumpClientPort, AVDumpKey,
    Calendar_UpdateFrequency, ClientPort, DownloadCharacters,
    DownloadCreators, DownloadRelatedAnime,
    DownloadReleaseGroups, File_UpdateFrequency,
    MaxRelationDepth, MyList_AddFiles, MyList_DeleteType,
    MyList_ReadWatched, MyList_ReadUnwatched, MyList_SetWatched,
    MyList_SetUnwatched, MyList_StorageState, MyList_UpdateFrequency,
    MyListStats_UpdateFrequency, Password, Username,
  } = newSettings.AniDb;

  const onDragEnd = (result: DropResult, episodePreference = false) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const items = Array.from(episodePreference ? newSettings.EpisodeLanguagePreference : newSettings.LanguagePreference);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    setNewSettings({ ...newSettings, [episodePreference ? 'EpisodeLanguagePreference' : 'LanguagePreference']: items as Array<string> });
  };

  const removeLanguage = (language: string, episodePreference = false) => {
    const items = Array.from(episodePreference ? newSettings.EpisodeLanguagePreference : newSettings.LanguagePreference);
    remove(items, item => item === language);
    setNewSettings({ ...newSettings, [episodePreference ? 'EpisodeLanguagePreference' : 'LanguagePreference']: items as Array<string> });
  };

  const testLogin = async () => {
    await testAniDbLoginTrigger({ Username, Password });
    if (testAniDbLoginResult.isError) {
      toast.error('Incorrect Username/Password!');
    } else {
      toast.success('AniDB Login Successful!');
    }
  };

  const validateAndSaveRelationDepth = (depth: string) => {
    if (parseInt(depth, 10) < 0 || parseInt(depth, 10) > 5) toast.error('Max Relation Depth may only be between 0 and 5');
    else updateSetting('AniDb', 'MaxRelationDepth', depth);
  };

  return (
    <>
      <div className="font-semibold text-xl">AniDB</div>
      <div className="flex flex-col mt-0.5 gap-y-4">
        <div className="flex justify-between">
          <div className="font-semibold">Login Options</div>
          <Button onClick={() => testLogin()} loading={testAniDbLoginResult.isLoading} className="!text-highlight-1 font-semibold !text-base">Test</Button>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between">
            Username
            <InputSmall id="username" value={Username} type="text" onChange={event => updateSetting('AniDb', 'Username', event.target.value)} className="w-32 px-3 py-1" />
          </div>
          <div className="flex justify-between">
            Password
            <InputSmall id="password" value={Password} type="password" onChange={event => updateSetting('AniDb', 'Password', event.target.value)} className="w-32 px-3 py-1" />
          </div>
          <div className="flex justify-between">
            Port
            <InputSmall id="port" value={ClientPort} type="number" onChange={event => updateSetting('AniDb', 'ClientPort', event.target.value)} className="w-32 px-3 py-1" />
          </div>
          <div className="flex justify-between">
            AVDump Key
            <InputSmall id="avdump-key" value={AVDumpKey} type="password" onChange={event => updateSetting('AniDb', 'AVDumpKey', event.target.value)} className="w-32 px-3 py-1" />
          </div>
          <div className="flex justify-between">
            AVDump Port
            <InputSmall id="avdump-port" value={AVDumpClientPort} type="number" onChange={event => updateSetting('AniDb', 'AVDumpClientPort', event.target.value)} className="w-32 px-3 py-1" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Download Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox justify label="Character Images" id="character-images" isChecked={DownloadCharacters} onChange={event => updateSetting('AniDb', 'DownloadCharacters', event.target.checked)} />
          <Checkbox justify label="Creator Images" id="creator-images" isChecked={DownloadCreators} onChange={event => updateSetting('AniDb', 'DownloadCreators', event.target.checked)} />
          <Checkbox justify label="Release Groups" id="release-groups" isChecked={DownloadReleaseGroups} onChange={event => updateSetting('AniDb', 'DownloadReleaseGroups', event.target.checked)} />
          <Checkbox justify label="Related Anime" id="related-anime" isChecked={DownloadRelatedAnime} onChange={event => updateSetting('AniDb', 'DownloadRelatedAnime', event.target.checked)} />
          <div className={cx('flex justify-between items-center transition-opacity', !DownloadRelatedAnime && 'pointer-events-none opacity-50')}>
            Related Depth
            <InputSmall id="max-relation-depth" value={MaxRelationDepth} type="number" onChange={event => validateAndSaveRelationDepth(event.target.value)} className="w-10 text-center px-3 py-1" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Mylist Options</div>
        <div className="flex flex-col gap-y-1">
          <Checkbox justify label="Add Files" id="add-files" isChecked={MyList_AddFiles} onChange={event => updateSetting('AniDb', 'MyList_AddFiles', event.target.checked)} />
          <Checkbox justify label="Read Watched" id="read-watched" isChecked={MyList_ReadWatched} onChange={event => updateSetting('AniDb', 'MyList_ReadWatched', event.target.checked)} />
          <Checkbox justify label="Read Unwatched" id="read-unwatched" isChecked={MyList_ReadUnwatched} onChange={event => updateSetting('AniDb', 'MyList_ReadUnwatched', event.target.checked)} />
          <Checkbox justify label="Set Watched" id="set-watched" isChecked={MyList_SetWatched} onChange={event => updateSetting('AniDb', 'MyList_SetWatched', event.target.checked)} />
          <Checkbox justify label="Set Unwatched" id="set-unwatched" isChecked={MyList_SetUnwatched} onChange={event => updateSetting('AniDb', 'MyList_SetUnwatched', event.target.checked)} />
          <div className="flex justify-between items-center">
            <span>Storage State</span>
            <SelectSmall id="storage-state" value={MyList_StorageState} onChange={event => updateSetting('AniDb', 'MyList_StorageState', event.target.value)}>
              <option value={0}>Unknown</option>
              <option value={1}>HDD</option>
              <option value={2}>Disk</option>
              <option value={3}>Deleted</option>
              <option value={4}>Remote</option>
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Delete Action</span>
            <SelectSmall id="delete-action" value={MyList_DeleteType} onChange={event => updateSetting('AniDb', 'MyList_DeleteType', event.target.value)}>
              <option value={0}>Delete File (AniDB)</option>
              <option value={1}>Delete File (Local)</option>
              <option value={2}>Mark Deleted</option>
              <option value={3}>Mark External (CD/DVD)</option>
              <option value={4}>Mark Unknown</option>
              <option value={5}>DVD/BD</option>
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Update Options</div>
        <div className="flex flex-col gap-y-1">
          <div className="flex justify-between items-center">
            <span>Calendar</span>
            <SelectSmall id="calendar" value={Calendar_UpdateFrequency} onChange={event => updateSetting('AniDb', 'Calendar_UpdateFrequency', event.target.value)}>
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Anime Information</span>
            <SelectSmall id="anime-information" value={Anime_UpdateFrequency} onChange={event => updateSetting('AniDb', 'Anime_UpdateFrequency', event.target.value)}>
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Sync Mylist</span>
            <SelectSmall id="sync-mylist" value={MyList_UpdateFrequency} onChange={event => updateSetting('AniDb', 'MyList_UpdateFrequency', event.target.value)}>
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Get Mylist Stats</span>
            <SelectSmall id="get-mylist-stats" value={MyListStats_UpdateFrequency} onChange={event => updateSetting('AniDb', 'MyListStats_UpdateFrequency', event.target.value)}>
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
          <div className="flex justify-between items-center">
            <span>Files With Missing Info</span>
            <SelectSmall id="files-missing-info" value={File_UpdateFrequency} onChange={event => updateSetting('AniDb', 'File_UpdateFrequency', event.target.value)}>
              <UpdateFrequencyValues />
            </SelectSmall>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="font-semibold">Language Options</div>
        <div className="flex flex-col gap-y-3">
          <Checkbox label="Also Use Synonyms" id="LanguageUseSynonyms" isChecked={newSettings.LanguageUseSynonyms} onChange={event => setNewSettings({ ...newSettings, LanguageUseSynonyms: event.target.checked })} justify />
          <div className="flex justify-between">
            Series Title (Drag to Reorder)
            <Button onClick={() => setShowLanguagesModal('Series')} tooltip="Add Language">
              <Icon className="text-highlight-1" path={mdiPlusCircleOutline} size={1} />
            </Button>
          </div>
          <div className="flex bg-background-border border border-background-border rounded-md px-3 py-2">
            <DnDList onDragEnd={result => onDragEnd(result)}>
              {newSettings.LanguagePreference.map(language => (
                {
                  key: language,
                  item: (
                    <div className="flex justify-between items-center mt-2.5 group-first:mt-0">
                      {languageDescription[language]}
                      <Button onClick={() => removeLanguage(language)} tooltip="Remove">
                        <Icon className="text-highlight-1" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    </div>
                  ),
                }
              ))}
            </DnDList>
          </div>
          <div className="flex justify-between">
            Episode Title (Drag to Reorder)
            <Button onClick={() => setShowLanguagesModal('Episode')} tooltip="Add Language">
              <Icon className="text-highlight-1" path={mdiPlusCircleOutline} size={1} />
            </Button>
          </div>
          <div className="flex bg-background-border border border-background-border rounded-md px-3 py-2">
            <DnDList onDragEnd={result => onDragEnd(result, true)}>
              {newSettings.EpisodeLanguagePreference.map(language => (
                {
                  key: language,
                  item: (
                    <div className="flex justify-between items-center mt-2.5 group-first:mt-0">
                      {languageDescription[language]}
                      <Button onClick={() => removeLanguage(language, true)} tooltip="Remove">
                        <Icon className="text-highlight-1" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    </div>
                  ),
                }
              ))}
            </DnDList>
          </div>
        </div>
      </div>

      <LanguagesModal type={showLanguagesModal} onClose={() => setShowLanguagesModal(null)} />
    </>
  );
}

export default AniDBSettings;
