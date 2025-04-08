from django import forms
from .models import Article

class ArticlePostForm(forms.ModelForm):
    # 新增分类选项配置
    CATEGORY_OPTIONS = [
        ('开发', [
            ('前端', '前端'),
            ('后端', '后端'),
            ('移动开发', '移动开发'),
            ('人工智能', '人工智能'),
        ]),
        ('文学', [
            ('小说', '小说'),
            ('诗歌', '诗歌'),
            ('散文', '散文'),
        ]),
        ('新闻', [
            ('校园新闻', '校园新闻'),
            ('科技资讯', '科技资讯'),
            ('社会热点', '社会热点'),
        ]),
        ('其他', [
            ('树洞', '树洞'),
            ('日志', '日志'),
        ]),
    ]

    category = forms.ChoiceField(
        label="文章分类",
        choices=CATEGORY_OPTIONS,
        widget=forms.Select(attrs={
            'class': 'form-select',
            'data-live-search': 'true'
        }),
        initial='树洞'  # 设置默认选中项
    )

    class Meta:
        model = Article
        fields = ['title', 'body', 'head_img', 'category']