import urllib.request
import json
import textwrap

url = 'http://qiita.com/api/v2/users/taqm/items'

with urllib.request.urlopen(url) as res:
    items = json.loads(res.read())
    for item in items:
        print('+++++')
        print('ファイル名を入力してください')
        print('投稿のタイトル: ' + item['title'])
        filename = input()

        with open('../posts/{}.md'.format(filename), 'w') as f:
            matter = '''
            ---
            title: "{title}"
            publishedAt: "{created_at}"
            ---

            '''.format(**item)
            f.write(textwrap.dedent(matter))
            f.write(item['body'])

